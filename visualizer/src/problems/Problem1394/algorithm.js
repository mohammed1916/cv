export const phases = [
  { id: 'start', label: 'Start', description: 'Count how often each value appears.' },
  { id: 'count', label: 'Count value', description: 'Add one to the count of the current value.' },
  { id: 'lucky', label: 'Lucky value', description: 'A value is lucky when its frequency equals the value itself; keep the largest lucky value.' },
  { id: 'skip', label: 'Not lucky', description: 'Frequency and value differ, so this value is not lucky.' },
  { id: 'done', label: 'Complete', description: 'Return the largest lucky value, or -1 if none exists.' },
]

export const examples = [
  { label: 'Two lucky values', input: '{"arr":[2,2,3,4]}' },
  { label: 'None lucky', input: '{"arr":[2,2,2,3,3]}' },
  { label: 'Repeated values', input: '{"arr":[1,2,2,3,3,3]}' },
  { label: "Single one", input: "{\"arr\":[1]}" },
  { label: "Largest value repeated", input: "{\"arr\":[500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500,500]}" },
  { label: "Equal counts, none lucky", input: "{\"arr\":[3,3,7,7,9]}" },
  { label: "Long run: 500 values", input: "{\"arr\":[389,360,152,135,220,466,105,379,329,333,146,183,180,360,148,126,103,251,306,409,451,63,353,106,333,76,223,458,195,334,232,132,115,344,466,469,337,22,206,406,167,114,329,337,482,461,250,354,261,58,117,379,107,26,61,376,434,223,459,414,42,335,269,1,483,437,151,239,226,116,166,442,237,381,32,23,251,228,476,64,112,310,396,95,180,338,152,259,452,431,423,147,150,254,205,219,145,444,152,341,256,410,65,124,20,231,487,321,218,19,471,232,30,206,219,129,324,369,397,377,216,316,98,38,160,282,1,371,447,211,426,273,118,232,116,313,442,50,179,158,185,108,263,307,85,486,168,155,17,151,200,82,500,285,227,315,287,26,500,22,429,121,433,134,324,71,165,99,376,14,353,318,26,184,261,215,39,428,334,449,54,382,98,449,23,31,308,62,312,6,430,210,330,98,143,126,206,82,190,296,138,85,14,431,183,348,259,360,354,352,316,386,52,425,262,283,449,38,98,210,88,154,399,453,81,104,33,50,414,84,302,446,491,18,422,483,169,115,431,121,183,112,221,445,448,304,494,114,389,79,112,46,39,320,400,244,310,140,90,311,423,60,247,319,141,355,94,309,68,417,338,355,377,106,163,206,1,210,230,198,397,217,122,206,158,265,307,51,339,246,306,414,23,156,400,407,242,427,309,97,33,96,421,394,481,267,264,351,286,496,38,19,475,301,159,178,11,166,380,322,188,3,183,468,327,183,272,434,393,355,99,385,290,412,3,49,236,70,153,162,203,180,119,286,68,471,11,301,229,111,258,478,68,28,229,180,270,116,6,348,136,48,258,63,131,36,292,104,78,29,469,24,470,444,308,436,68,158,223,267,20,107,465,419,389,479,461,361,105,95,377,322,460,205,334,375,424,54,378,322,139,194,358,424,125,134,71,132,310,78,100,119,157,70,407,21,255,52,404,423,404,421,292,258,300,312,136,412,101,467,233,443,245,157,471,448,27,261,9,262,77,240,203,251,485,334,374,137,466,484,89,379,63,63,294,283,35,148,230,121,169,190,213,182,418,48,472,287,356,498,353,444,96,438,351,408,421,144,37,94,16,49,57,345,296,151,56,253,490,278,437,299,204,50,57,231,376,36,29,231]}" },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.arr)) throw new Error('Use an object with an arr list, such as {"arr":[2,2,3,4]}.')
  if (data.arr.length < 1 || data.arr.length > 500) throw new Error('arr must have 1 to 500 values.')
  if (!data.arr.every(v => Number.isInteger(v) && v >= 1 && v <= 500)) throw new Error('Every value must be an integer from 1 to 500.')
  return { arr: data.arr }
}

export function buildTrace({ arr }) {
  const count = new Map()
  let best = -1
  const rows = () => [...count.entries()].sort((a, b) => a[0] - b[0]).map(([value, n]) => ({ value, count: n, lucky: n === value ? 'yes' : '' }))
  const snap = (extra = {}) => ({ counts: rows(), best, ...extra })
  const frames = [{ phase: 'start', activeLine: L('const count = new Map()'), pythonLine: P('count = Counter'), snapshot: snap(),
    message: `Count the values in ${arr.length} entries, then find the largest value whose count equals itself.` }]
  for (const v of arr) {
    count.set(v, (count.get(v) || 0) + 1)
    frames.push({ phase: 'count', activeLine: L('count.set(v'), pythonLine: P('count = Counter'), snapshot: snap({ current: v }),
      message: `${v} seen; it now has ${count.get(v)} copies.` })
  }
  for (const [value, n] of [...count.entries()].sort((a, b) => a[0] - b[0])) {
    if (n === value) {
      best = Math.max(best, value)
      frames.push({ phase: 'lucky', activeLine: L('if (n === value)'), pythonLine: P('if n == value'), snapshot: snap({ current: value }),
        message: `${value} appears ${n} time(s), so it is lucky; the best is now ${best}.` })
    } else {
      frames.push({ phase: 'skip', activeLine: L('if (n === value)'), pythonLine: P('if n == value'), snapshot: snap({ current: value }),
        message: `${value} appears ${n} time(s), not ${value}, so it is not lucky.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), snapshot: snap({ result: best }),
    message: `Return ${best}.`, result: best })
  return { input: { arr }, result: best, frames }
}

export const code = `function findLucky(arr) {
  const count = new Map()
  for (const v of arr) count.set(v, (count.get(v) || 0) + 1)
  let best = -1
  for (const [value, n] of count) {
    if (n === value) best = Math.max(best, value)
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
export const pythonLineMap = { 1: 3, 2: 4, 3: 4, 4: 5, 5: 6, 6: 7, 7: 7, 8: 9 }

export const python = `from collections import Counter

def find_lucky(arr):
    count = Counter(arr)
    best = -1
    for value, n in count.items():
        if n == value:
            best = max(best, value)
    return best
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
