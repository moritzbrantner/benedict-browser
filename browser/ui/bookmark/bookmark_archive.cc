/* Copyright (c) 2026 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/browser/ui/bookmark/bookmark_archive.h"

#include <string>
#include <utility>

#include "base/check.h"
#include "base/strings/utf_string_conversions.h"
#include "components/bookmarks/browser/bookmark_model.h"
#include "components/bookmarks/browser/bookmark_node.h"
#include "url/gurl.h"

namespace brave::bookmarks {

namespace {

const ::bookmarks::BookmarkNode* FindChildByUrl(
    const ::bookmarks::BookmarkNode* parent,
    const GURL& url) {
  for (const auto& child : parent->children()) {
    if (child->is_url() && child->url() == url) {
      return child.get();
    }
  }
  return nullptr;
}

}  // namespace

const ::bookmarks::BookmarkNode* GetArchiveFolder(
    const ::bookmarks::BookmarkModel* model) {
  CHECK(model);
  const auto* other_node = model->other_node();
  for (const auto& child : other_node->children()) {
    if (child->is_folder() && child->GetTitle() == kArchiveFolderTitle) {
      return child.get();
    }
  }
  return nullptr;
}

const ::bookmarks::BookmarkNode* GetOrCreateArchiveFolder(
    ::bookmarks::BookmarkModel* model) {
  CHECK(model);
  if (const auto* folder = GetArchiveFolder(model)) {
    return folder;
  }
  return model->AddFolder(model->other_node(), 0, kArchiveFolderTitle);
}

const ::bookmarks::BookmarkNode* ArchiveUrl(::bookmarks::BookmarkModel* model,
                                            const GURL& url,
                                            std::u16string title) {
  CHECK(model);
  CHECK(url.is_valid());

  const auto* archive_folder = GetOrCreateArchiveFolder(model);
  if (const auto* existing = FindChildByUrl(archive_folder, url)) {
    return existing;
  }

  if (title.empty()) {
    title = base::UTF8ToUTF16(url.spec());
  }
  return model->AddURL(archive_folder, archive_folder->children().size(),
                       std::move(title), url);
}

bool IsUrlArchived(const ::bookmarks::BookmarkModel* model, const GURL& url) {
  CHECK(model);
  const auto* archive_folder = GetArchiveFolder(model);
  return archive_folder && FindChildByUrl(archive_folder, url);
}

}  // namespace brave::bookmarks
