// Copyright (c) 2026 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at https://mozilla.org/MPL/2.0/.

import path from 'node:path'
import { defineConfig } from 'vitest/config'

const generatedModulePrefixes = [
  'gen/',
  'chrome://resources/',
  'chrome://interstitials/',
]

export default defineConfig({
  plugins: [
    {
      name: 'brave-generated-module-fallback',
      resolveId(id) {
        if (generatedModulePrefixes.some((prefix) => id.startsWith(prefix))) {
          return `\0brave-generated:${id}`
        }
      },
      load(id) {
        if (id.startsWith('\0brave-generated:')) {
          return `
            const enumMock = new Proxy({}, {
              get: (_target, prop) => prop,
            })
            const remoteMock = new Proxy({}, {
              get: () => () => undefined,
            })
            export const BraveNewsController = {
              getRemote: () => remoteMock,
            }
            export const CardType = enumMock
            export const PublisherType = enumMock
            export const UserEnabled = enumMock
            export default {}
          `
        }
      },
    },
  ],
  resolve: {
    alias: {
      '$web-common': path.resolve(import.meta.dirname, 'components/common'),
      '$test-utils': path.resolve(import.meta.dirname, 'components/test'),
      'brave-ui': path.resolve(
        import.meta.dirname,
        'node_modules/@brave/brave-ui',
      ),
    },
  },
  test: {
    clearMocks: true,
    environment: 'jsdom',
    globals: true,
    include: ['**/*.test.{js,ts,tsx}', 'components/test/**/*_test.{ts,tsx}'],
    exclude: [
      'build/commands/lib/test.js',
      'build/rustup/**',
      'third_party/**',
      'tools/crates/vendor/**',
    ],
    setupFiles: ['components/test/testSetup.ts'],
    testTimeout: 30000,
  },
})
