/* Copyright (c) 2026 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/components/nsfw_filter/renderer/nsfw_filter_render_frame_observer.h"

#include <algorithm>
#include <optional>
#include <set>
#include <string>
#include <utility>

#include "base/containers/span.h"
#include "base/functional/bind.h"
#include "base/no_destructor.h"
#include "base/strings/stringprintf.h"
#include "base/time/time.h"
#include "base/values.h"
#include "content/public/renderer/render_frame.h"
#include "third_party/blink/public/mojom/script/script_type.mojom.h"
#include "third_party/blink/public/platform/web_isolated_world_info.h"
#include "third_party/blink/public/web/web_local_frame.h"
#include "third_party/blink/public/web/web_script_source.h"
#include "url/gurl.h"

namespace nsfw_filter {
namespace {

constexpr char kSecurityOrigin[] = "chrome://nsfw-filter";
constexpr int kMinThreshold = 0;
constexpr int kMaxThreshold = 100;
constexpr int kMinAction = 0;
constexpr int kMaxAction = 3;

using ObserverSet = std::set<NsfwFilterRenderFrameObserver*>;

ObserverSet& GetObservers() {
  static base::NoDestructor<ObserverSet> observers;
  return *observers;
}

int ClampThreshold(int value) {
  return std::clamp(value, kMinThreshold, kMaxThreshold);
}

int ClampAction(int value) {
  return std::clamp(value, kMinAction, kMaxAction);
}

void EnsureIsolatedWorldInitialized(int32_t world_id) {
  static std::optional<int32_t> initialized_world_id;
  if (initialized_world_id) {
    DCHECK_EQ(*initialized_world_id, world_id);
    return;
  }

  initialized_world_id = world_id;

  blink::WebIsolatedWorldInfo info;
  info.security_origin =
      blink::WebSecurityOrigin::Create(GURL(kSecurityOrigin));
  info.content_security_policy = blink::WebString::FromUTF8("");
  blink::SetIsolatedWorldInfo(world_id, info);
}

std::string MakeScript(const NsfwFilterConfig& config, int generation) {
  const int moderate_threshold = ClampThreshold(config.moderate_threshold);
  const int high_threshold = std::max(
      moderate_threshold, ClampThreshold(config.high_threshold));
  const int moderate_action = ClampAction(config.moderate_action);
  const int high_action = ClampAction(config.high_action);
  const char* enabled = config.enabled ? "true" : "false";

  return base::StringPrintf(R"JS(
(() => {
  const config = {
    enabled: %s,
    generation: %d,
    moderateThreshold: %d,
    highThreshold: %d,
    moderateAction: %d,
    highAction: %d,
  };

  if (globalThis.__braveNsfwFilterUpdateConfig) {
    globalThis.__braveNsfwFilterUpdateConfig(config);
    return;
  }

  let currentConfig = config;
  let currentGeneration = config.generation;
  globalThis.__braveNsfwFilterUpdateConfig = nextConfig => {
    if (nextConfig.generation < currentGeneration) {
      return;
    }
    currentGeneration = nextConfig.generation;
    currentConfig = nextConfig;
    if (!currentConfig.enabled) {
      clearAllImages();
      return;
    }
    scanAllImages();
  };

  const processed = new WeakMap();
  const pending = new Set();
  let scheduled = false;

  const ACTION_NONE = 0;
  const ACTION_BLUR = 1;
  const ACTION_HIDE = 2;
  const ACTION_COLLAPSE = 3;

  function clampScore(value) {
    if (!Number.isFinite(value)) {
      return 0;
    }
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  function installStyle() {
    if (!document.documentElement ||
        document.getElementById('brave-nsfw-filter-style')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'brave-nsfw-filter-style';
    style.textContent = `
      img[data-brave-nsfw-action="blur"] {
        filter: blur(24px) !important;
      }
      img[data-brave-nsfw-action="hide"] {
        visibility: hidden !important;
      }
      img[data-brave-nsfw-action="collapse"] {
        display: none !important;
      }
    `;
    document.documentElement.appendChild(style);
  }

  function getImageKey(img) {
    return [
      img.currentSrc || img.src || '',
      img.srcset || '',
      img.naturalWidth || 0,
      img.naturalHeight || 0,
    ].join('|');
  }

  function metadataScore(img) {
    const value = [
      img.currentSrc,
      img.src,
      img.alt,
      img.title,
      img.getAttribute('aria-label'),
      img.className,
      img.id,
    ].join(' ').toLowerCase();

    if (!value) {
      return 0;
    }

    const decoded = (() => {
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    })();

    const strong = [
      'nsfw', 'porn', 'porno', 'xxx', 'x-rated', 'hentai', 'nude', 'naked',
      'explicit', 'erotic', 'onlyfans', 'brazzers',
    ];
    const medium = [
      'sex', 'sexy', 'breast', 'boob', 'ass', 'butt', 'lingerie', 'bikini',
      'fetish', 'camgirl', 'playboy', 'strip',
    ];

    let score = 0;
    for (const token of strong) {
      if (decoded.includes(token)) {
        score = Math.max(score, 90);
      }
    }
    for (const token of medium) {
      if (decoded.includes(token)) {
        score = Math.max(score, 55);
      }
    }
    return score;
  }

  function pixelScore(img) {
    if (!img.naturalWidth || !img.naturalHeight) {
      return null;
    }

    const canvas = document.createElement('canvas');
    const maxDimension = 32;
    const scale = Math.min(maxDimension / img.naturalWidth,
                           maxDimension / img.naturalHeight, 1);
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      return null;
    }

    try {
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let total = 0;
      let skin = 0;
      let saturatedSkin = 0;
      let warm = 0;

      for (let i = 0; i < pixels.length; i += 4) {
        const alpha = pixels[i + 3];
        if (alpha < 32) {
          continue;
        }

        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;
        const skinLike =
            r > 95 && g > 40 && b > 20 &&
            r > g && r > b &&
            Math.abs(r - g) > 15 &&
            saturation > 0.18;

        total++;
        if (r > g && g >= b && saturation > 0.18) {
          warm++;
        }
        if (skinLike) {
          skin++;
          if (saturation > 0.28) {
            saturatedSkin++;
          }
        }
      }

      if (!total) {
        return 0;
      }

      const skinRatio = skin / total;
      const saturatedRatio = saturatedSkin / total;
      const warmRatio = warm / total;
      let score = 0;
      if (skinRatio > 0.18) {
        score += (skinRatio - 0.18) * 145;
      }
      if (saturatedRatio > 0.10) {
        score += (saturatedRatio - 0.10) * 95;
      }
      if (warmRatio > 0.45 && skinRatio > 0.22) {
        score += 12;
      }
      if (skinRatio > 0.44) {
        score += 18;
      } else if (skinRatio > 0.32) {
        score += 9;
      }

      return clampScore(score);
    } catch {
      return null;
    }
  }

  function scoreImage(img) {
    const meta = metadataScore(img);
    const pixels = pixelScore(img);
    if (pixels === null) {
      return meta;
    }
    if (meta >= 80) {
      return Math.max(meta, pixels);
    }
    return clampScore(Math.max(pixels, meta, pixels + meta * 0.25));
  }

  function chooseAction(score) {
    if (!currentConfig.enabled) {
      return ACTION_NONE;
    }
    if (score >= currentConfig.highThreshold) {
      return currentConfig.highAction;
    }
    if (score >= currentConfig.moderateThreshold) {
      return currentConfig.moderateAction;
    }
    return ACTION_NONE;
  }

  function actionName(action) {
    switch (action) {
      case ACTION_BLUR:
        return 'blur';
      case ACTION_HIDE:
        return 'hide';
      case ACTION_COLLAPSE:
        return 'collapse';
      default:
        return 'none';
    }
  }

  function applyAction(img, score, action) {
    img.dataset.braveNsfwScore = String(score);
    const name = actionName(action);
    if (name === 'none') {
      delete img.dataset.braveNsfwAction;
      return;
    }
    img.dataset.braveNsfwAction = name;
  }

  function clearAction(img) {
    delete img.dataset.braveNsfwScore;
    delete img.dataset.braveNsfwAction;
  }

  function clearAllImages() {
    pending.clear();
    document.querySelectorAll('img').forEach(clearAction);
  }

  function shouldScan(img) {
    if (!(img instanceof HTMLImageElement) || !img.isConnected) {
      return false;
    }
    if (!img.complete || !img.naturalWidth || !img.naturalHeight) {
      return false;
    }
    if (img.naturalWidth < 24 || img.naturalHeight < 24) {
      return false;
    }
    return processed.get(img) !== getImageKey(img);
  }

  function scan(img) {
    if (!currentConfig.enabled) {
      clearAction(img);
      return;
    }
    if (!shouldScan(img)) {
      return;
    }
    processed.set(img, getImageKey(img));
    const score = scoreImage(img);
    applyAction(img, score, chooseAction(score));
  }

  function processQueue(deadline) {
    scheduled = false;
    if (!currentConfig.enabled) {
      clearAllImages();
      return;
    }
    installStyle();
    let count = 0;
    for (const img of Array.from(pending)) {
      pending.delete(img);
      scan(img);
      count++;
      if (count >= 8 ||
          (deadline && deadline.timeRemaining && deadline.timeRemaining() < 2)) {
        break;
      }
    }
    if (pending.size) {
      schedule();
    }
  }

  function schedule() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    if ('requestIdleCallback' in window) {
      requestIdleCallback(processQueue, { timeout: 500 });
    } else {
      setTimeout(() => processQueue(null), 50);
    }
  }

  function enqueue(img) {
    if (!(img instanceof HTMLImageElement)) {
      return;
    }
    pending.add(img);
    schedule();
  }

  function scanAllImages() {
    document.querySelectorAll('img').forEach(enqueue);
  }

  function observeMutations() {
    if (!document.documentElement) {
      return;
    }
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
          enqueue(mutation.target);
          continue;
        }
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLImageElement) {
            enqueue(node);
          } else if (node.querySelectorAll) {
            node.querySelectorAll('img').forEach(enqueue);
          }
        }
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['src', 'srcset', 'alt', 'title', 'class', 'id'],
      childList: true,
      subtree: true,
    });
  }

  document.addEventListener('load', event => enqueue(event.target), true);

  function start() {
    installStyle();
    observeMutations();
    if (!currentConfig.enabled) {
      clearAllImages();
      return;
    }
    scanAllImages();
    setTimeout(scanAllImages, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
)JS",
                            enabled, generation, moderate_threshold,
                            high_threshold, moderate_action, high_action);
}

}  // namespace

NsfwFilterRenderFrameObserver::NsfwFilterRenderFrameObserver(
    content::RenderFrame* render_frame,
    int32_t isolated_world_id,
    GetConfigCallback get_config)
    : RenderFrameObserver(render_frame),
      isolated_world_id_(isolated_world_id),
      get_config_(std::move(get_config)) {
  GetObservers().insert(this);
}

NsfwFilterRenderFrameObserver::~NsfwFilterRenderFrameObserver() {
  GetObservers().erase(this);
}

// static
void NsfwFilterRenderFrameObserver::ApplyConfigurationToAllFrames() {
  for (NsfwFilterRenderFrameObserver* observer : GetObservers()) {
    observer->ApplyLatestConfiguration();
  }
}

void NsfwFilterRenderFrameObserver::DidCreateNewDocument() {
  injected_for_current_document_ = false;
  EnsureIsolatedWorldInitialized(isolated_world_id_);
}

void NsfwFilterRenderFrameObserver::DidCreateScriptContext(
    v8::Local<v8::Context> context,
    int32_t world_id) {
  if (world_id == isolated_world_id_) {
    MaybeInjectScript();
  }
}

void NsfwFilterRenderFrameObserver::DidFinishLoad() {
  MaybeInjectScript();
}

void NsfwFilterRenderFrameObserver::MaybeInjectScript() {
  if (injected_for_current_document_ || !render_frame() ||
      !render_frame()->GetWebFrame()) {
    return;
  }

  const auto config = get_config_.Run();
  if (!config.enabled) {
    return;
  }

  InjectOrUpdateScript(config);
}

void NsfwFilterRenderFrameObserver::ApplyLatestConfiguration() {
  if (!render_frame() || !render_frame()->GetWebFrame()) {
    return;
  }

  const auto config = get_config_.Run();
  if (!config.enabled && !injected_for_current_document_) {
    return;
  }

  InjectOrUpdateScript(config);
}

void NsfwFilterRenderFrameObserver::InjectOrUpdateScript(
    const NsfwFilterConfig& config) {
  EnsureIsolatedWorldInitialized(isolated_world_id_);
  blink::WebScriptSource source(
      blink::WebString::FromUTF8(MakeScript(config,
                                            ++configuration_generation_)));
  render_frame()->GetWebFrame()->RequestExecuteScript(
      isolated_world_id_, base::span_from_ref(source),
      blink::mojom::UserActivationOption::kDoNotActivate,
      blink::mojom::EvaluationTiming::kAsynchronous,
      blink::mojom::LoadEventBlockingOption::kDoNotBlock,
      base::BindOnce([](std::optional<base::Value>, base::TimeTicks) {}),
      blink::BackForwardCacheAware::kAllow,
      blink::mojom::WantResultOption::kNoResult,
      blink::mojom::PromiseResultOption::kDoNotWait);
  injected_for_current_document_ = true;
}

void NsfwFilterRenderFrameObserver::OnDestruct() {
  delete this;
}

}  // namespace nsfw_filter
