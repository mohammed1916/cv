// Sum of Weighted Modes in Subarrays. For each length-k window, find the most frequent value
// (ties go to the smaller value), weight it by its frequency, and add all window weights.

const MAX_LENGTH = 12
const MAX_VALUE = 9

const CODE_TEXT = [
  'FUNCTION sumWeightedModes(nums, k)',
  '    total ← 0',
  '    FOR start from 0 to len(nums) − k',
  '        counts ← frequencies of nums[start .. start + k − 1]',
  '        best ← value with the highest count, ties to the smaller value',
  '        total ← total + best × counts[best]',
  '    RETURN total',
]

const PY = [
  'def sum_weighted_modes(nums, k):',
  '    total = 0',
  '    for start in range(len(nums) - k + 1):',
  '        counts = {}',
  '        for x in nums[start:start + k]:',
  '            counts[x] = counts.get(x, 0) + 1',
  '        best = None',
  '        for value, count in counts.items():',
  '            if best is None or count > counts[best] or (count == counts[best] and value < best):',
  '                best = value',
  '        total += best * counts[best]',
  '    return total',
  '',
  'if __name__ == "__main__":',
  '    import sys, json',
  '    data = json.loads(sys.stdin.read())',
  '    print(json.dumps(sum_weighted_modes(data["nums"], data["k"])))',
]

const PHASES = [
  { id: 'setup', label: 'Start', description: 'Begin with a zero total.' },
  { id: 'window', label: 'Window', description: 'Count the values in this window.' },
  { id: 'mode', label: 'Mode', description: 'Pick the most frequent value.' },
  { id: 'add', label: 'Add', description: 'Add best times its frequency to the total.' },
  { id: 'done', label: 'Result', description: 'Report the total.' },
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
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= MAX_VALUE)) throw new Error(`Each value is an integer from 1 to ${MAX_VALUE}.`)
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k is an integer from 1 to the length of nums.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  let total = 0
  const frames = [{ pythonLine: P('total = 0'), phase: 'setup', activeLine: L('total ← 0'), start: null, counts: {}, best: null, total, message: `Each window has length ${k}.` }]
  for (let start = 0; start <= nums.length - k; start++) {
    const counts = new Map()
    for (const x of nums.slice(start, start + k)) counts.set(x, (counts.get(x) || 0) + 1)
    frames.push({ pythonLine: P('for x in nums[start'), phase: 'window', activeLine: L('counts ← frequencies'), start, counts: Object.fromEntries(counts), best: null, total, message: `Window ${start}..${start + k - 1} counted.` })
    let best = null
    for (const [value, count] of counts) {
      if (best === null || count > counts.get(best) || (count === counts.get(best) && value < best)) best = value
    }
    frames.push({ pythonLine: P('best = value'), phase: 'mode', activeLine: L('best ← value with the highest'), start, counts: Object.fromEntries(counts), best, total, message: `Mode is ${best} with count ${counts.get(best)}.` })
    total += best * counts.get(best)
    frames.push({ pythonLine: P('total += best'), phase: 'add', activeLine: L('total ← total + best'), start, counts: Object.fromEntries(counts), best, total, message: `Add ${best} × ${counts.get(best)} = ${best * counts.get(best)}; total is ${total}.` })
  }
  frames.push({ pythonLine: P('return total'), phase: 'done', activeLine: L('RETURN total'), start: null, counts: {}, best: null, total, message: `The weighted modes sum to ${total}.` })
  return { input: { nums, k }, result: total, frames }
}
