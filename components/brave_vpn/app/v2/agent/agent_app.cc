/* Copyright (c) 2026 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include "brave/components/brave_vpn/app/v2/agent/agent_app.h"

#include "base/check.h"
#include "base/logging.h"
#include "brave/components/brave_vpn/app/v2/shared/app_utils.h"
#include "brave/components/brave_vpn/app/v2/shared/switches.h"
#include "build/build_config.h"

namespace brave_vpn {
namespace v2 {

AgentApp::AgentApp() : initialized_(false) {}

AgentApp::~AgentApp() = default;

std::optional<int> AgentApp::Initialize(const base::CommandLine& command_line) {
  CHECK(!initialized_) << "Initialize should only be called once.";
  AppInitLogging(command_line);
  initialized_ = true;
  return std::nullopt;
}

int AgentApp::Run() {
  CHECK(initialized_) << "Run should only be called after initialization.";
  VLOG(1) << "Hello from the Brave VPN Agent!";
  return 0;
}

}  // namespace v2
}  // namespace brave_vpn
