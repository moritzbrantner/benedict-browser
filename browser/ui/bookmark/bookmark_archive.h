/* Copyright (c) 2026 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_BROWSER_UI_BOOKMARK_BOOKMARK_ARCHIVE_H_
#define BRAVE_BROWSER_UI_BOOKMARK_BOOKMARK_ARCHIVE_H_

#include <string>

class GURL;

namespace bookmarks {
class BookmarkModel;
class BookmarkNode;
}  // namespace bookmarks

namespace brave::bookmarks {

inline constexpr char16_t kArchiveFolderTitle[] = u"Archive";

const ::bookmarks::BookmarkNode* GetArchiveFolder(
    const ::bookmarks::BookmarkModel* model);
const ::bookmarks::BookmarkNode* GetOrCreateArchiveFolder(
    ::bookmarks::BookmarkModel* model);
const ::bookmarks::BookmarkNode* ArchiveUrl(::bookmarks::BookmarkModel* model,
                                            const GURL& url,
                                            std::u16string title);
bool IsUrlArchived(const ::bookmarks::BookmarkModel* model, const GURL& url);

}  // namespace brave::bookmarks

#endif  // BRAVE_BROWSER_UI_BOOKMARK_BOOKMARK_ARCHIVE_H_
