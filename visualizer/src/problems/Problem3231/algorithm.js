// LeetCode 3231: Minimum Number of Increasing Subsequence to Be Removed.
// Think of each removed strictly increasing subsequence as a pile that grows by appending values.
// A value x joins the pile with the largest top below x, which keeps the tops as large as possible.
// If no top is below x, x starts a new pile. The number of piles is the answer.

const CODE_TEXT = [
  'FUNCTION minRemovals(nums)',
  '    tops ← empty list, kept in ascending order',
  '    FOR each x in nums',
  '        k ← number of tops less than x',
  '        IF k is greater than 0 THEN',
  '            tops[k minus 1] ← x',
  '        ELSE',
  '            insert x at the front of tops',
  '    RETURN length of tops',
]

export const code = CODE_TEXT.map((text, index) => ({ line: index + 1, text }))

export const python = `from bisect import bisect_left


def min_increasing_removals(nums):
    tops = []
    for x in nums:
        k = bisect_left(tops, x)
        if k > 0:
            tops[k - 1] = x
        else:
            tops.insert(0, x)
    return len(tops)


if __name__ == "__main__":
    import json, sys
    print(min_increasing_removals(json.loads(sys.stdin.read())))
`

const PY_LINES = python.split('\n')
const L = s => { const n = code.findIndex(c => c.text.includes(s)) + 1; if (!n) throw new Error(`Missing pseudocode line: ${s}`); return n }
const P = s => { const n = PY_LINES.findIndex(l => l.includes(s)) + 1; if (!n) throw new Error(`Missing Python line: ${s}`); return n }

export const phases = [
  { id: 'start', label: 'Piles', description: 'Start with no piles.' },
  { id: 'search', label: 'Search', description: 'Count the piles whose top is below x.' },
  { id: 'place', label: 'Append', description: 'Append x to the pile with the largest top below x.' },
  { id: 'new', label: 'New pile', description: 'No top is below x, so x starts a pile.' },
  { id: 'done', label: 'Result', description: 'Each pile is one removable increasing subsequence.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums is an array of 1 to 12 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= 99)) throw new Error('Each value is an integer from 0 to 99.')
  return nums.slice()
}

export function buildTrace(nums) {
  const piles = []
  const frames = []
  const snap = extra => ({ nums, piles: piles.map(p => p.slice()), tops: piles.map(p => p[p.length - 1]), ...extra })
  frames.push(snap({ phase: 'start', activeLine: L('tops ← empty'), pythonLine: P('tops = []'), x: null, index: -1, k: -1, target: -1, message: `${nums.length} values; no piles yet.` }))
  for (let index = 0; index < nums.length; index++) {
    const x = nums[index]
    let k = 0
    while (k < piles.length && piles[k][piles[k].length - 1] < x) k++
    frames.push(snap({ phase: 'search', activeLine: L('k ← number of tops'), pythonLine: P('k = bisect_left'), x, index, k, target: -1, message: `x = ${x}: ${k} pile top${k === 1 ? '' : 's'} sit below it.` }))
    if (k > 0) {
      piles[k - 1].push(x)
      frames.push(snap({ phase: 'place', activeLine: L('tops[k minus 1] ← x'), pythonLine: P('tops[k - 1] = x'), x, index, k, target: k - 1, message: `Append ${x} to the pile whose top was ${piles[k - 1][piles[k - 1].length - 2]}.` }))
    } else {
      piles.unshift([x])
      frames.push(snap({ phase: 'new', activeLine: L('insert x at the front'), pythonLine: P('tops.insert(0, x)'), x, index, k, target: 0, message: `Every top is at least ${x}; start a new pile at the front.` }))
    }
  }
  const answer = piles.length
  frames.push(snap({ phase: 'done', activeLine: L('RETURN length of tops'), pythonLine: P('return len(tops)'), x: null, index: nums.length - 1, k: -1, target: -1, message: `${answer} pile${answer === 1 ? '' : 's'}: at least ${answer} removal${answer === 1 ? '' : 's'} are needed.` }))
  return { input: nums, result: answer, frames }
}
