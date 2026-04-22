// Copyright (c) 2026 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at https://mozilla.org/MPL/2.0/.

import { spawnSync } from 'node:child_process'

// Run the TypeScript compiler.
run('tsc', ['--project', 'build/commands'])

// Check formatting for changed command scripts.
const changedCommandFiles = getChangedFiles().filter((file) => {
  return (
    file.startsWith('build/commands/') &&
    /\.(js|jsx|ts|tsx|mjs|mts|json|jsonc)$/.test(file)
  )
})
if (changedCommandFiles.length > 0) {
  run('oxfmt', [
    '--check',
    '--config',
    '.oxfmtrc.json',
    '--ignore-path',
    '.prettierignore',
    ...changedCommandFiles,
  ])
}

// Run the Vitest test runner. Pass through any extra arguments to it.
run('vitest', ['run', 'build/commands', ...process.argv.slice(2)])

// Run a command and exit on error.
function run(cmd: string, args: string[]): void {
  console.log(`> ${cmd} ${args.join(' ')}`)
  if (process.platform === 'win32') {
    args = ['/c', cmd, ...args]
    cmd = 'cmd'
  }
  const result = spawnSync(cmd, args, { stdio: 'inherit' })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

function getChangedFiles(): string[] {
  const result = spawnSync(
    'git',
    ['diff', '--name-only', '--diff-filter=ACMRTUXB', 'upstream/master'],
    { encoding: 'utf-8' },
  )
  if (result.status !== 0) {
    process.stderr.write(result.stderr)
    process.exit(result.status ?? 1)
  }
  return result.stdout.split(/\r?\n/).filter(Boolean)
}
