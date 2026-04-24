/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

export type LiturgicalColor = 'green' | 'violet' | 'rose' | 'white' | 'red'

export type LiturgicalSeason =
  | 'Advent'
  | 'Christmas'
  | 'Ordinary Time'
  | 'Lent'
  | 'Sacred Triduum'
  | 'Easter'

export type LiturgicalRank =
  | 'season'
  | 'memorial'
  | 'feast'
  | 'solemnity'

export interface LiturgicalTheme {
  background: string
  accent: string
  textColor: string
  badgeBackground: string
}

export interface LiturgicalDay {
  season: LiturgicalSeason
  color: LiturgicalColor
  celebration: string
  rank: LiturgicalRank
  isFeastDay: boolean
  rankLabel: string
  seasonLabel: string
  colorLabel: string
  theme: LiturgicalTheme
}

interface CelebrationOverride {
  celebration: string
  rank: LiturgicalRank
  color: LiturgicalColor
}

interface DatedCelebration extends CelebrationOverride {
  date: Date
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

function atNoon(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12)
}

function makeDate(year: number, monthIndex: number, day: number): Date {
  return new Date(year, monthIndex, day, 12)
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY)
}

function sameDay(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate()
}

function isBetweenInclusive(date: Date, start: Date, end: Date): boolean {
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime()
}

function sundayBetweenJanuary2And8(year: number): Date {
  for (let day = 2; day <= 8; day++) {
    const date = makeDate(year, 0, day)
    if (date.getDay() === 0) {
      return date
    }
  }

  return makeDate(year, 0, 6)
}

function baptismOfTheLord(year: number): Date {
  const epiphany = sundayBetweenJanuary2And8(year)
  return epiphany.getDate() >= 7
    ? addDays(epiphany, 1)
    : addDays(epiphany, 7)
}

function firstSundayOfAdvent(year: number): Date {
  const decemberThird = makeDate(year, 11, 3)
  return addDays(decemberThird, -decemberThird.getDay())
}

function getEasterSunday(year: number): Date {
  const century = Math.floor(year / 100)
  const yearOfCentury = year % 100
  const leapCentury = Math.floor(century / 4)
  const centuryRemainder = century % 4
  const correction = Math.floor((century + 8) / 25)
  const moonCorrection = Math.floor((century - correction + 1) / 3)
  const goldenNumber = (19 * (year % 19) + century - leapCentury - moonCorrection + 15) % 30
  const yearLeap = Math.floor(yearOfCentury / 4)
  const yearRemainder = yearOfCentury % 4
  const weekday = (32 + 2 * centuryRemainder + 2 * yearLeap - goldenNumber - yearRemainder) % 7
  const monthAdjustment = Math.floor((year % 19 + 11 * goldenNumber + 22 * weekday) / 451)
  const month = Math.floor((goldenNumber + weekday - 7 * monthAdjustment + 114) / 31)
  const day = ((goldenNumber + weekday - 7 * monthAdjustment + 114) % 31) + 1

  return makeDate(year, month - 1, day)
}

function getHolyFamily(year: number): Date {
  for (let day = 26; day <= 31; day++) {
    const date = makeDate(year, 11, day)
    if (date.getDay() === 0) {
      return date
    }
  }

  return makeDate(year, 11, 30)
}

function getAnnunciation(year: number): Date {
  const easterSunday = getEasterSunday(year)
  const palmSunday = addDays(easterSunday, -7)
  const divineMercySunday = addDays(easterSunday, 7)
  const march25 = makeDate(year, 2, 25)

  return isBetweenInclusive(march25, palmSunday, divineMercySunday)
    ? addDays(divineMercySunday, 1)
    : march25
}

function getSeasonDefaults(date: Date): {
  season: LiturgicalSeason
  color: LiturgicalColor
  celebration: string
  rank: LiturgicalRank
} {
  const year = date.getFullYear()
  const christmasDay = makeDate(year, 11, 25)
  const baptism = baptismOfTheLord(year)
  if (date.getMonth() === 11 && date.getDate() >= 25) {
    return {
      season: 'Christmas',
      color: 'white',
      celebration: 'Christmas Season',
      rank: 'season'
    }
  }

  if (date.getMonth() === 0 && isBetweenInclusive(date, makeDate(year, 0, 1), baptism)) {
    return {
      season: 'Christmas',
      color: 'white',
      celebration: 'Christmas Season',
      rank: 'season'
    }
  }

  const adventStart = firstSundayOfAdvent(year)
  if (isBetweenInclusive(date, adventStart, addDays(christmasDay, -1))) {
    const gaudeteSunday = addDays(adventStart, 14)

    return {
      season: 'Advent',
      color: sameDay(date, gaudeteSunday) ? 'rose' : 'violet',
      celebration: 'Advent',
      rank: 'season'
    }
  }

  const easterSunday = getEasterSunday(year)
  const ashWednesday = addDays(easterSunday, -46)
  const holyThursday = addDays(easterSunday, -3)
  const goodFriday = addDays(easterSunday, -2)
  const holySaturday = addDays(easterSunday, -1)
  const pentecost = addDays(easterSunday, 49)
  const laetareSunday = addDays(easterSunday, -21)

  if (sameDay(date, holyThursday)) {
    return {
      season: 'Sacred Triduum',
      color: 'white',
      celebration: 'Holy Thursday',
      rank: 'solemnity'
    }
  }

  if (sameDay(date, goodFriday)) {
    return {
      season: 'Sacred Triduum',
      color: 'red',
      celebration: 'Friday of the Passion of the Lord',
      rank: 'solemnity'
    }
  }

  if (sameDay(date, holySaturday)) {
    return {
      season: 'Sacred Triduum',
      color: 'violet',
      celebration: 'Holy Saturday',
      rank: 'solemnity'
    }
  }

  if (isBetweenInclusive(date, ashWednesday, addDays(holyThursday, -1))) {
    return {
      season: 'Lent',
      color: sameDay(date, laetareSunday) ? 'rose' : 'violet',
      celebration: 'Lent',
      rank: 'season'
    }
  }

  if (isBetweenInclusive(date, easterSunday, pentecost)) {
    return {
      season: 'Easter',
      color: 'white',
      celebration: 'Easter Season',
      rank: 'season'
    }
  }

  return {
    season: 'Ordinary Time',
    color: 'green',
    celebration: 'Ordinary Time',
    rank: 'season'
  }
}

function getMovableCelebrations(year: number): DatedCelebration[] {
  const easterSunday = getEasterSunday(year)
  const palmSunday = addDays(easterSunday, -7)
  const pentecost = addDays(easterSunday, 49)
  const trinitySunday = addDays(easterSunday, 56)
  const corpusChristi = addDays(easterSunday, 63)
  const sacredHeart = addDays(easterSunday, 68)
  const christTheKing = addDays(firstSundayOfAdvent(year), -7)

  return [
    {
      celebration: 'The Holy Family of Jesus, Mary and Joseph',
      rank: 'feast',
      color: 'white'
    },
    {
      celebration: 'Mary, the Holy Mother of God',
      rank: 'solemnity',
      color: 'white'
    },
    {
      celebration: 'The Epiphany of the Lord',
      rank: 'solemnity',
      color: 'white'
    },
    {
      celebration: 'The Baptism of the Lord',
      rank: 'feast',
      color: 'white'
    },
    {
      celebration: 'Ash Wednesday',
      rank: 'solemnity',
      color: 'violet'
    },
    {
      celebration: 'Palm Sunday of the Passion of the Lord',
      rank: 'solemnity',
      color: 'red'
    },
    {
      celebration: 'Easter Sunday of the Resurrection of the Lord',
      rank: 'solemnity',
      color: 'white'
    },
    {
      celebration: 'Pentecost Sunday',
      rank: 'solemnity',
      color: 'red'
    },
    {
      celebration: 'The Most Holy Trinity',
      rank: 'solemnity',
      color: 'white'
    },
    {
      celebration: 'The Most Holy Body and Blood of Christ',
      rank: 'solemnity',
      color: 'white'
    },
    {
      celebration: 'The Most Sacred Heart of Jesus',
      rank: 'solemnity',
      color: 'white'
    },
    {
      celebration: 'Our Lord Jesus Christ, King of the Universe',
      rank: 'solemnity',
      color: 'white'
    }
  ].map((entry, index) => {
    const date = [
      getHolyFamily(year),
      makeDate(year, 0, 1),
      sundayBetweenJanuary2And8(year),
      baptismOfTheLord(year),
      addDays(easterSunday, -46),
      palmSunday,
      easterSunday,
      pentecost,
      trinitySunday,
      corpusChristi,
      sacredHeart,
      christTheKing
    ][index]

    return {
      ...entry,
      date
    }
  })
}

function getFixedCelebrations(year: number): DatedCelebration[] {
  return [
    { date: makeDate(year, 0, 25), celebration: 'The Conversion of Saint Paul, Apostle', rank: 'feast', color: 'white' },
    { date: makeDate(year, 1, 2), celebration: 'The Presentation of the Lord', rank: 'feast', color: 'white' },
    { date: makeDate(year, 1, 22), celebration: 'The Chair of Saint Peter, Apostle', rank: 'feast', color: 'white' },
    { date: makeDate(year, 2, 19), celebration: 'Saint Joseph, Spouse of the Blessed Virgin Mary', rank: 'solemnity', color: 'white' },
    { date: getAnnunciation(year), celebration: 'The Annunciation of the Lord', rank: 'solemnity', color: 'white' },
    { date: makeDate(year, 3, 25), celebration: 'Saint Mark, Evangelist', rank: 'feast', color: 'red' },
    { date: makeDate(year, 4, 3), celebration: 'Saints Philip and James, Apostles', rank: 'feast', color: 'red' },
    { date: makeDate(year, 4, 14), celebration: 'Saint Matthias, Apostle', rank: 'feast', color: 'red' },
    { date: makeDate(year, 4, 31), celebration: 'The Visitation of the Blessed Virgin Mary', rank: 'feast', color: 'white' },
    { date: makeDate(year, 5, 24), celebration: 'The Nativity of Saint John the Baptist', rank: 'solemnity', color: 'white' },
    { date: makeDate(year, 5, 29), celebration: 'Saints Peter and Paul, Apostles', rank: 'solemnity', color: 'red' },
    { date: makeDate(year, 6, 3), celebration: 'Saint Thomas, Apostle', rank: 'feast', color: 'red' },
    { date: makeDate(year, 6, 22), celebration: 'Saint Mary Magdalene', rank: 'feast', color: 'white' },
    { date: makeDate(year, 6, 25), celebration: 'Saint James, Apostle', rank: 'feast', color: 'red' },
    { date: makeDate(year, 7, 6), celebration: 'The Transfiguration of the Lord', rank: 'feast', color: 'white' },
    { date: makeDate(year, 7, 15), celebration: 'The Assumption of the Blessed Virgin Mary', rank: 'solemnity', color: 'white' },
    { date: makeDate(year, 7, 24), celebration: 'Saint Bartholomew, Apostle', rank: 'feast', color: 'red' },
    { date: makeDate(year, 8, 14), celebration: 'The Exaltation of the Holy Cross', rank: 'feast', color: 'red' },
    { date: makeDate(year, 8, 21), celebration: 'Saint Matthew, Apostle and Evangelist', rank: 'feast', color: 'red' },
    { date: makeDate(year, 8, 29), celebration: 'Saints Michael, Gabriel, and Raphael, Archangels', rank: 'feast', color: 'white' },
    { date: makeDate(year, 9, 18), celebration: 'Saint Luke, Evangelist', rank: 'feast', color: 'red' },
    { date: makeDate(year, 9, 28), celebration: 'Saints Simon and Jude, Apostles', rank: 'feast', color: 'red' },
    { date: makeDate(year, 10, 1), celebration: 'All Saints', rank: 'solemnity', color: 'white' },
    { date: makeDate(year, 10, 2), celebration: 'The Commemoration of All the Faithful Departed', rank: 'memorial', color: 'violet' },
    { date: makeDate(year, 10, 9), celebration: 'The Dedication of the Lateran Basilica', rank: 'feast', color: 'white' },
    { date: makeDate(year, 10, 30), celebration: 'Saint Andrew, Apostle', rank: 'feast', color: 'red' },
    { date: makeDate(year, 11, 8), celebration: 'The Immaculate Conception of the Blessed Virgin Mary', rank: 'solemnity', color: 'white' },
    { date: makeDate(year, 11, 12), celebration: 'Our Lady of Guadalupe', rank: 'feast', color: 'white' },
    { date: makeDate(year, 11, 25), celebration: 'The Nativity of the Lord', rank: 'solemnity', color: 'white' },
    { date: makeDate(year, 11, 26), celebration: 'Saint Stephen, the First Martyr', rank: 'feast', color: 'red' },
    { date: makeDate(year, 11, 27), celebration: 'Saint John, Apostle and Evangelist', rank: 'feast', color: 'white' },
    { date: makeDate(year, 11, 28), celebration: 'The Holy Innocents, Martyrs', rank: 'feast', color: 'red' },
  ]
}

function getCelebrationOverride(date: Date): CelebrationOverride | undefined {
  const movableCelebrations = getMovableCelebrations(date.getFullYear())
  const fixedCelebrations = getFixedCelebrations(date.getFullYear())
  const celebrations = [...movableCelebrations, ...fixedCelebrations]

  return celebrations.find((entry) => sameDay(date, entry.date))
}

function getColorLabel(color: LiturgicalColor): string {
  switch (color) {
    case 'green':
      return 'Green'
    case 'violet':
      return 'Violet'
    case 'rose':
      return 'Rose'
    case 'white':
      return 'White'
    case 'red':
      return 'Red'
  }
}

function getThemeForDay(season: LiturgicalSeason, color: LiturgicalColor): LiturgicalTheme {
  switch (color) {
    case 'green':
      return {
        background: 'linear-gradient(135deg, #0f3b28 0%, #1f6b45 52%, #8ebf63 100%)',
        accent: '#b7d98c',
        textColor: '#ffffff',
        badgeBackground: 'rgba(183, 217, 140, 0.22)'
      }
    case 'violet':
      if (season === 'Lent') {
        return {
          background: 'linear-gradient(135deg, #24172f 0%, #4d2f63 55%, #7f5b88 100%)',
          accent: '#d6c1e1',
          textColor: '#ffffff',
          badgeBackground: 'rgba(214, 193, 225, 0.18)'
        }
      }

      return {
        background: 'linear-gradient(135deg, #2b1748 0%, #5a3391 55%, #7a5bb9 100%)',
        accent: '#dcccf7',
        textColor: '#ffffff',
        badgeBackground: 'rgba(220, 204, 247, 0.18)'
      }
    case 'rose':
      return {
        background: 'linear-gradient(135deg, #6c224f 0%, #c25c91 52%, #f0b5cf 100%)',
        accent: '#ffe6f1',
        textColor: '#ffffff',
        badgeBackground: 'rgba(255, 230, 241, 0.2)'
      }
    case 'white':
      return {
        background: season === 'Easter'
          ? 'linear-gradient(135deg, #f6efe1 0%, #f9f6ee 45%, #e7c36a 100%)'
          : 'linear-gradient(135deg, #f8f3e8 0%, #ffffff 42%, #e9d5a1 100%)',
        accent: '#8a6a1f',
        textColor: '#2f2416',
        badgeBackground: 'rgba(138, 106, 31, 0.12)'
      }
    case 'red':
      return {
        background: 'linear-gradient(135deg, #53131d 0%, #9f2635 48%, #d98b44 100%)',
        accent: '#ffd6c0',
        textColor: '#ffffff',
        badgeBackground: 'rgba(255, 214, 192, 0.18)'
      }
  }
}

function getRankLabel(rank: LiturgicalRank): string {
  switch (rank) {
    case 'solemnity':
      return 'Solemnity'
    case 'feast':
      return 'Feast Day'
    case 'memorial':
      return 'Memorial'
    case 'season':
      return 'Season'
  }
}

export function getLiturgicalDay(input: Date = new Date()): LiturgicalDay {
  const date = atNoon(input)
  const defaults = getSeasonDefaults(date)
  const override = getCelebrationOverride(date)

  const season = defaults.season
  const color = override?.color ?? defaults.color
  const celebration = override?.celebration ?? defaults.celebration
  const rank = override?.rank ?? defaults.rank

  return {
    season,
    color,
    celebration,
    rank,
    isFeastDay: rank === 'feast' || rank === 'solemnity',
    rankLabel: getRankLabel(rank),
    seasonLabel: season,
    colorLabel: getColorLabel(color),
    theme: getThemeForDay(season, color)
  }
}
