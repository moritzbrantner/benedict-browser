// Copyright (c) 2020 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at https://mozilla.org/MPL/2.0/.

import styled from 'styled-components'

export const StyledClock = styled('div')<{}>`
  color: var(--override-readability-color, #FFFFFF);
  box-sizing: border-box;
  line-height: 1;
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  -webkit-font-smoothing: antialiased;
  font-family: ${p => p.theme.fontFamily.heading};
`

export const StyledTime = styled('span')<{}>`
  box-sizing: border-box;
  font-size: 78px;
  font-weight: 300;
  color: inherit;
  display: inline-flex;
`

export const StyledClockMeta = styled('div')<{}>`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
`

export const StyledDateRow = styled('div')<{}>`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
`

export const StyledDate = styled('span')<{}>`
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.01em;
  opacity: 0.92;
`

export const StyledFeastBadge = styled('span')<{}>`
  padding: 6px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--override-readability-color, #ffffff) 15%, transparent);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const StyledCelebration = styled('span')<{}>`
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
  max-width: 28ch;
  text-align: right;
`

export const StyledSeason = styled('span')<{}>`
  font-size: 13px;
  font-weight: 500;
  opacity: 0.8;
  letter-spacing: 0.03em;
`

export const StyledTimeSeparator = styled('span')<{}>`
  box-sizing: border-box;
  color: inherit;
  font-size: inherit;
  font-weight: 200;
  /* center colon vertically in the text-content line */
  margin-top: -0.1em;
`
