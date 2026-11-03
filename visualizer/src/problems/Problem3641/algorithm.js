// Longest Semi-Repeating Subarray. A value is repeated when it occurs two or more times
// in the window; each repeated value counts once. The window shrinks from the left
// while more than k values are repeated.

const MAX_LENGTH = 14
const MAX_VALUE = 9

const CODE_TEXT = [
  'FUNCTION longestWindow(nums, k)',
  '    counts ← empty map; repeated ← 0; left ← 0; best ← 0',
  '    FOR right from 0 to len(nums) − 1',
  '        add nums[right]; if its count becomes 2 then repeated ← repeated + 1',
  '        WHILE repeated > k',
  '            remove nums[left]; if its count was 2 then repeated ← repeated − 1',
  '            left ← left + 1',
  '        best ← max(best, right − left + 1)',
  '    RETURN best',
]

const PY = [
  'def longest_semi_repeating(nums, k):',
  '    counts = {}',
  '    repeated = 0',
  '    left = 0',
  '    best = 0',
  '    for right, value in enumerate(nums):',
  '        counts[value] = counts.get(value, 0) + 1',
  '        if counts[value] == 2:',
  '            repeated += 1',
  '        while repeated > k:',
  '            out = nums[left]',
  '            if counts[out] == 2:',
  '                repeated -= 1',
  '            counts[out] -= 1',
  '            left += 1',
  '        best = max(best, right - left + 1)',
  '    return best',
  '',
  'if __name__ == "__main__":',
  '    import sys, json',
  '    data = json.loads(sys.stdin.read())',
  '    print(json.dumps(longest_semi_repeating(data["nums"], data["k"])))',
]

const PHASES = [
  { id: 'setup', label: 'Start', description: 'Begin with an empty window.' },
  { id: 'extend', label: 'Extend', description: 'Add the next value on the right.' },
  { id: 'repeat', label: 'Repeat', description: 'A value now occurs twice.' },
  { id: 'shrink', label: 'Shrink', description: 'Drop values from the left until the repeats fit.' },
  { id: 'record', label: 'Record', description: 'Keep the longest valid window.' },
  { id: 'done', label: 'Result', description: 'Report the longest window length.' },
]

export const code = CODE_TEXT.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n')
export const phases = PHASES

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = PY.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || typeof data !== 'object') throw new Error('Use an object with nums and k.')
  const { nums, k } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LENGTH) throw new Error(`nums has 1 to ${MAX_LENGTH} values.`)
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= MAX_VALUE)) throw new Error(`Each value is an integer from 0 to ${MAX_VALUE}.`)
  if (!Number.isInteger(k) || k < 0 || k > 5) throw new Error('k is an integer from 0 to 5.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const counts = new Map()
  let repeated = 0
  let left = 0
  let best = 0
  let bestRange = [0, 0]
  const snapshot = () => ({ window: [left, Math.max(left, right)], repeated, counts: Object.fromEntries(counts) })
  let right = -1
  const frames = [{ pythonLine: P('counts = {}'), phase: 'setup', activeLine: L('counts ← empty map'), ...snapshot(), best, bestRange, k, message: `Start with an empty window; at most ${k} values may repeat.` }]
  for (right = 0; right < nums.length; right++) {
    const value = nums[right]
    counts.set(value, (counts.get(value) || 0) + 1)
    const becameRepeated = counts.get(value) === 2
    if (becameRepeated) repeated++
    frames.push({ pythonLine: P('counts[value] = counts.get'), phase: becameRepeated ? 'repeat' : 'extend', activeLine: L('add nums[right]'), ...snapshot(), best, bestRange, k, message: becameRepeated ? `Value ${value} now occurs twice; repeated values: ${repeated}.` : `Add ${value}; repeated values stay at ${repeated}.` })
    while (repeated > k) {
      const out = nums[left]
      if (counts.get(out) === 2) repeated--
      counts.set(out, counts.get(out) - 1)
      left++
      frames.push({ pythonLine: P('left += 1'), phase: 'shrink', activeLine: L('remove nums[left]'), ...snapshot(), best, bestRange, k, message: `Drop ${out} from the left; repeated values now ${repeated}.` })
    }
    const length = right - left + 1
    if (length > best) {
      best = length
      bestRange = [left, right]
    }
    frames.push({ pythonLine: P('best = max'), phase: 'record', activeLine: L('best ← max'), ...snapshot(), best, bestRange, k, message: `Window ${left}..${right} has length ${length}; best is ${best}.` })
  }
  frames.push({ pythonLine: P('return best'), phase: 'done', activeLine: L('RETURN best'), window: null, repeated, counts: Object.fromEntries(counts), best, bestRange, k, message: `Longest window has length ${best}.` })
  return { input: { nums, k }, result: best, frames }
}
