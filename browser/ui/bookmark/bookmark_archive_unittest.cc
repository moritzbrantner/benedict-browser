/* Copyright (c) 2026 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/browser/ui/bookmark/bookmark_archive.h"

#include <memory>
#include <string>

#include "components/bookmarks/browser/bookmark_model.h"
#include "components/bookmarks/browser/bookmark_node.h"
#include "components/bookmarks/test/test_bookmark_client.h"
#include "testing/gtest/include/gtest/gtest.h"
#include "url/gurl.h"

namespace brave::bookmarks {

namespace {

std::unique_ptr<::bookmarks::BookmarkModel> CreateBookmarkModel() {
  return ::bookmarks::TestBookmarkClient::CreateModel();
}

}  // namespace

TEST(BookmarkArchiveTest, CreatesArchiveFolderUnderOtherBookmarks) {
  auto model = CreateBookmarkModel();

  EXPECT_FALSE(GetArchiveFolder(model.get()));

  const auto* archive_folder = GetOrCreateArchiveFolder(model.get());

  ASSERT_TRUE(archive_folder);
  EXPECT_TRUE(archive_folder->is_folder());
  EXPECT_EQ(std::u16string(kArchiveFolderTitle), archive_folder->GetTitle());
  EXPECT_EQ(model->other_node(), archive_folder->parent());
}

TEST(BookmarkArchiveTest, ArchiveUrlAddsBookmarkOnce) {
  auto model = CreateBookmarkModel();
  const GURL url("https://example.com/article");

  const auto* first = ArchiveUrl(model.get(), url, u"Article");
  const auto* second = ArchiveUrl(model.get(), url, u"Duplicate title");

  EXPECT_EQ(first, second);
  EXPECT_TRUE(IsUrlArchived(model.get(), url));
  ASSERT_TRUE(GetArchiveFolder(model.get()));
  EXPECT_EQ(1u, GetArchiveFolder(model.get())->children().size());
}

TEST(BookmarkArchiveTest, ArchiveUrlUsesUrlAsFallbackTitle) {
  auto model = CreateBookmarkModel();
  const GURL url("https://example.com/no-title");

  const auto* node = ArchiveUrl(model.get(), url, {});

  ASSERT_TRUE(node);
  EXPECT_EQ(std::u16string(u"https://example.com/no-title"), node->GetTitle());
}

}  // namespace brave::bookmarks
