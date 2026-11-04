export const phases = [
  { id: 'start', label: 'Start', description: 'Track the best sum for each remainder mod 3. The empty choice gives sum 0 with remainder 0; the other remainders are not reachable yet.' },
  { id: 'take', label: 'Take or skip each number', description: 'For each number x, a choice either skips it or adds it to an earlier selection. Each option lands in the remainder class (r + x) mod 3, and we keep the larger sum there.' },
  { id: 'done', label: 'Complete', description: 'The best sum with remainder 0 is the answer: it is the greatest sum divisible by three.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Enter a JSON array of 1 to 12 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 99)) throw new Error('Each value is an integer from 1 to 99 in this view.')
  return nums
}

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
const NONE = -Infinity

export function buildTrace(nums) {
  let best = [0, NONE, NONE]
  const show = values => values.map(v => (v === NONE ? null : v))
  const snap = (extra = {}) => ({ nums, best: show(best), ...extra })
  const frames = [{
    phase: 'start', activeLine: L('let best = [0, -Infinity'), pythonLine: P('best = [0, NEG, NEG]'), snapshot: snap({ index: -1 }),
    message: `Remainder 0 starts at sum 0. Remainders 1 and 2 are empty for now. We read ${nums.length} numbers.`,
  }]

  nums.forEach((x, index) => {
    const next = best.slice()
    for (let r = 0; r < 3; r++) {
      if (best[r] === NONE) continue
      const nr = (r + x) % 3
      next[nr] = Math.max(next[nr], best[r] + x)
    }
    best = next
    frames.push({
      phase: 'take', activeLine: L('best = next'), pythonLine: P('best = nxt'),
      snapshot: snap({ index, x, next: show(best) }),
      message: `Number ${x} (remainder ${x % 3}). Best sums by remainder are now ${show(best).map(v => (v === null ? 'none' : v)).join(', ')} for remainders 0, 1 and 2.`,
    })
  })

  frames.push({
    phase: 'done', activeLine: L('return best[0]'), pythonLine: P('return best[0]'), snapshot: snap({ index: nums.length, answer: best[0] }),
    message: `Return ${best[0]}, the best sum whose remainder mod 3 is 0.`,
  })
  return { input: nums, result: best[0], frames }
}

export const code = [
  "function maxSumDivThree(nums) {",
  "  let best = [0, -Infinity, -Infinity]",
  "  for (const x of nums) {",
  "    const next = [...best]",
  "    for (let r = 0; r < 3; r++) {",
  "      if (best[r] === -Infinity) continue",
  "      const nr = (r + x) % 3",
  "      next[nr] = Math.max(next[nr], best[r] + x)",
  "    }",
  "    best = next",
  "  }",
  "  return best[0]",
  "}",
].map((text, index) => ({ line: index + 1, text }))

export const python = `def max_div3(nums):
    NEG = float("-inf")
    best = [0, NEG, NEG]
    for x in nums:
        nxt = best[:]
        for r in range(3):
            if best[r] == NEG:
                continue
            nr = (r + x) % 3
            nxt[nr] = max(nxt[nr], best[r] + x)
        best = nxt
    return best[0]
`
