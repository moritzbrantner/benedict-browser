/* Copyright (c) 2026 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_COMPONENTS_NSFW_FILTER_RENDERER_NSFW_FILTER_RENDER_FRAME_OBSERVER_H_
#define BRAVE_COMPONENTS_NSFW_FILTER_RENDERER_NSFW_FILTER_RENDER_FRAME_OBSERVER_H_

#include <cstdint>

#include "base/functional/callback.h"
#include "content/public/renderer/render_frame_observer.h"

namespace nsfw_filter {

struct NsfwFilterConfig {
  bool enabled = false;
  int moderate_threshold = 55;
  int high_threshold = 85;
  int moderate_action = 1;
  int high_action = 2;
};

class NsfwFilterRenderFrameObserver : public content::RenderFrameObserver {
 public:
  using GetConfigCallback = base::RepeatingCallback<NsfwFilterConfig()>;

  NsfwFilterRenderFrameObserver(content::RenderFrame* render_frame,
                                int32_t isolated_world_id,
                                GetConfigCallback get_config);
  NsfwFilterRenderFrameObserver(const NsfwFilterRenderFrameObserver&) = delete;
  NsfwFilterRenderFrameObserver& operator=(
      const NsfwFilterRenderFrameObserver&) = delete;
  ~NsfwFilterRenderFrameObserver() override;

  static void ApplyConfigurationToAllFrames();

  // content::RenderFrameObserver:
  void DidCreateNewDocument() override;
  void DidCreateScriptContext(v8::Local<v8::Context> context,
                              int32_t world_id) override;
  void DidFinishLoad() override;

 private:
  void MaybeInjectScript();
  void ApplyLatestConfiguration();
  void InjectOrUpdateScript(const NsfwFilterConfig& config);
  void OnDestruct() override;

  int32_t isolated_world_id_;
  bool injected_for_current_document_ = false;
  int configuration_generation_ = 0;
  GetConfigCallback get_config_;
};

}  // namespace nsfw_filter

#endif  // BRAVE_COMPONENTS_NSFW_FILTER_RENDERER_NSFW_FILTER_RENDER_FRAME_OBSERVER_H_
