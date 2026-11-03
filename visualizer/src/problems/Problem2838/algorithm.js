// LeetCode 2838: Maximum Coins Heroes Can Collect (draft rules).
// A hero with strength h defeats every monster whose strength is at most h (>= reading), independently of other heroes.
// Sort monsters by strength, take prefix sums of their coins, and binary search each hero's count.

const isInt = (value, low, high) => Number.isInteger(value) && value >= low && value <= high

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with heroes and monsters.')
  const { heroes, monsters } = input
  if (!Array.isArray(heroes) || heroes.length < 1 || heroes.length > 6 || !heroes.every(h => isInt(h, 1, 20))) {
    throw new Error('heroes has 1 to 6 strengths from 1 to 20.')
  }
  if (!Array.isArray(monsters) || monsters.length < 1 || monsters.length > 8) throw new Error('monsters has 1 to 8 pairs.')
  for (const pair of monsters) {
    if (!Array.isArray(pair) || pair.length !== 2 || !isInt(pair[0], 1, 20) || !isInt(pair[1], 1, 20)) {
      throw new Error('Each monster is [strength, coins] with values from 1 to 20.')
    }
  }
  return { heroes, monsters }
}

const CODE_TEXT = [
  'maximum coins for each hero',
  '  sorted ← monsters ordered by strength ascending',
  '  prefix[0] ← 0',
  '  FOR j from 1 to number of monsters',
  '    prefix[j] ← prefix[j - 1] + coins of sorted[j - 1]',
  '  FOR each hero h',
  '    lo ← 0; hi ← number of monsters',
  '    WHILE lo < hi',
  '      mid ← (lo + hi) div 2',
  '      IF strength of sorted[mid] ≤ h THEN lo ← mid + 1 ELSE hi ← mid',
  '    append prefix[lo] to answers',
  '  return answers',
]

export const code = CODE_TEXT.map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

const PYTHON_TEXT = `def maximum_coins(heroes, monsters):
    sorted_monsters = sorted(monsters)
    prefix = [0]
    for strength, coins in sorted_monsters:
        prefix.append(prefix[-1] + coins)
    answers = []
    for h in heroes:
        lo, hi = 0, len(sorted_monsters)
        while lo < hi:
            mid = (lo + hi) // 2
            if sorted_monsters[mid][0] <= h:
                lo = mid + 1
            else:
                hi = mid
        answers.append(prefix[lo])
    return answers
`

export const python = PYTHON_TEXT

const P = s => {
  const index = PYTHON_TEXT.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export const phases = [
  { id: 'sort', label: 'Sort', description: 'Order monsters by strength.' },
  { id: 'prefix', label: 'Prefix', description: 'Add coins in strength order.' },
  { id: 'search', label: 'Search', description: 'Find how many monsters a hero can beat.' },
  { id: 'answer', label: 'Answer', description: 'Read the coin total for the hero.' },
  { id: 'done', label: 'Result', description: 'Return one total per hero.' },
]

export function buildTrace({ heroes, monsters }) {
  const frames = []
  const sorted = [...monsters].sort((a, b) => a[0] - b[0])
  const m = sorted.length
  const prefix = [0]
  const answers = []
  const base = () => ({ sorted: sorted.map(p => [...p]), prefix: [...prefix], hero: -1, lo: -1, hi: -1, mid: -1, answers: [...answers] })
  frames.push({ ...base(), phase: 'sort', activeLine: L('sorted ← monsters ordered'), pythonLine: P('sorted_monsters = sorted(monsters)'), message: `Monsters sorted by strength: ${sorted.map(p => p[0]).join(', ')}.` })
  for (let j = 1; j <= m; j++) {
    prefix.push(prefix[j - 1] + sorted[j - 1][1])
    frames.push({ ...base(), phase: 'prefix', activeLine: L('prefix[j] ← prefix[j - 1]'), pythonLine: P('prefix.append(prefix[-1] + coins)'), message: `Prefix ${j} is ${prefix[j]} after adding ${sorted[j - 1][1]} coins.` })
  }
  for (let hi0 = 0; hi0 < heroes.length; hi0++) {
    const h = heroes[hi0]
    let lo = 0, hi = m
    frames.push({ ...base(), hero: hi0, phase: 'search', activeLine: L('lo ← 0; hi ← number'), pythonLine: P('lo, hi = 0, len(sorted_monsters)'), lo, hi, message: `Hero ${hi0 + 1} has strength ${h}; search the monsters it can beat.` })
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2)
      frames.push({ ...base(), hero: hi0, phase: 'search', activeLine: L('mid ← (lo + hi)'), pythonLine: P('mid = (lo + hi) // 2'), lo, hi, mid, message: `Check monster at position ${mid}, strength ${sorted[mid][0]}, against hero strength ${h}.` })
      if (sorted[mid][0] <= h) lo = mid + 1
      else hi = mid
      frames.push({ ...base(), hero: hi0, phase: 'search', activeLine: L('IF strength of sorted[mid]'), pythonLine: P('lo = mid + 1'), lo, hi, mid, message: `${sorted[mid][0] <= h ? 'Beatable' : 'Too strong'}; window is now [${lo}, ${hi}).` })
    }
    answers.push(prefix[lo])
    frames.push({ ...base(), hero: hi0, phase: 'answer', activeLine: L('append prefix[lo]'), pythonLine: P('answers.append(prefix[lo])'), lo, hi, mid: -1, message: `Hero ${hi0 + 1} beats ${lo} monsters for ${prefix[lo]} coins.` })
  }
  frames.push({ ...base(), phase: 'done', activeLine: L('return answers'), pythonLine: P('return answers'), message: `Totals: ${answers.join(', ')}.` })
  return { input: { heroes, monsters }, result: answers, frames }
}
