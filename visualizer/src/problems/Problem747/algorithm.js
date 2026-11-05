export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 50 || nums.some(v => !Number.isInteger(v) || v < 0 || v > 100)) throw new Error('Enter 1–50 integers from 0 to 100.')
  return nums
}

const JS_LINES = [
  'function dominantIndex(nums) {',
  '  let best = -1, first = -Infinity, second = -Infinity // best index, largest and second largest values',
  '  for (let i = 0; i < nums.length; i++) {',
  '    if (nums[i] > first) { second = first; first = nums[i]; best = i } // a new largest value',
  '    else if (nums[i] > second) second = nums[i] // a new second-largest value',
  '  }',
  '  return first >= 2 * second ? best : -1 // the largest must be at least twice every other value',
  '}',
]
const PY_LINES = [
  'def dominant_index(nums):',
  '    best, first, second = -1, float(\'-inf\'), float(\'-inf\')',
  '    for i, value in enumerate(nums):',
  '        if value > first:',
  '            second, first, best = first, value, i',
  '        elif value > second:',
  '            second = value',
  '    return best if first >= 2 * second else -1',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// One pass keeps the largest value (with its index) and the second largest. The largest wins only if it is at least twice the second.
export function buildTrace(nums) {
  let best = -1, first = -Infinity, second = -Infinity
  const frames = [{ phase: 'start', i: -1, best, first: null, second: null, activeLine: L('let best = -1'), pythonLine: P('best, first, second'), message: 'No values seen yet.' }]
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] > first) { second = first; first = nums[i]; best = i; frames.push({ phase: 'new-max', i, best, first, second: Number.isFinite(second) ? second : null, activeLine: L('a new largest value'), pythonLine: P('second, first, best'), message: `${nums[i]} is the new largest (index ${i}); the old largest drops to second place.` }) }
    else if (nums[i] > second) { second = nums[i]; frames.push({ phase: 'new-second', i, best, first, second, activeLine: L('a new second-largest value'), pythonLine: P('second = value'), message: `${nums[i]} is the new second largest.` }) }
    else frames.push({ phase: 'skip', i, best, first, second, activeLine: L('else if (nums[i] > second)'), pythonLine: P('elif value > second'), message: `${nums[i]} is not above the top two; nothing changes.` })
  }
  const ok = first >= 2 * second
  const result = ok ? best : -1
  frames.push({ phase: 'done', i: nums.length - 1, best, first, second, result, activeLine: L('return first >= 2'), pythonLine: P('return best if'), message: ok ? `${first} is at least twice ${second}: index ${best}.` : `${first} is not at least twice ${second}: -1.` })
  return { input: nums, result, frames }
}
