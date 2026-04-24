/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

import { getLiturgicalDay } from './liturgicalCalendar'

describe('getLiturgicalDay', () => {
  it('marks Gaudete Sunday in rose', () => {
    const day = getLiturgicalDay(new Date(2025, 11, 14))

    expect(day.season).toBe('Advent')
    expect(day.color).toBe('rose')
    expect(day.isFeastDay).toBe(false)
  })

  it('marks Christmas with a white solemnity', () => {
    const day = getLiturgicalDay(new Date(2025, 11, 25))

    expect(day.season).toBe('Christmas')
    expect(day.color).toBe('white')
    expect(day.rank).toBe('solemnity')
    expect(day.celebration).toContain('Nativity of the Lord')
  })

  it('marks Ash Wednesday as Lent in violet', () => {
    const day = getLiturgicalDay(new Date(2026, 1, 18))

    expect(day.season).toBe('Lent')
    expect(day.color).toBe('violet')
    expect(day.celebration).toBe('Ash Wednesday')
  })

  it('marks Palm Sunday in red', () => {
    const day = getLiturgicalDay(new Date(2026, 2, 29))

    expect(day.color).toBe('red')
    expect(day.rank).toBe('solemnity')
    expect(day.celebration).toContain('Palm Sunday')
  })

  it('marks Easter Sunday as a white solemnity', () => {
    const day = getLiturgicalDay(new Date(2026, 3, 5))

    expect(day.season).toBe('Easter')
    expect(day.color).toBe('white')
    expect(day.rank).toBe('solemnity')
  })

  it('marks Pentecost Sunday in red', () => {
    const day = getLiturgicalDay(new Date(2026, 4, 24))

    expect(day.season).toBe('Easter')
    expect(day.color).toBe('red')
    expect(day.celebration).toBe('Pentecost Sunday')
  })

  it('marks ordinary time in green', () => {
    const day = getLiturgicalDay(new Date(2026, 6, 10))

    expect(day.season).toBe('Ordinary Time')
    expect(day.color).toBe('green')
    expect(day.isFeastDay).toBe(false)
  })

  it('marks Christ the King before Advent', () => {
    const day = getLiturgicalDay(new Date(2026, 10, 22))

    expect(day.color).toBe('white')
    expect(day.rank).toBe('solemnity')
    expect(day.celebration).toContain('King of the Universe')
  })
})
