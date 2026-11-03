const CODE = [
  'bitwise OR of the sum of every subsequence',
  'total is the sum of all numbers',
  'reach[0] is true and every other sum is unreachable',
  'for each number x in nums',
  '  for each sum s from total down to x',
  '    if sum s minus x is reachable, mark s reachable',
  'result is 0',
  'for each reachable sum s, result is result OR s',
  'return result',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))

const PY = [
  'def bitwise_or_of_subsequence_sums(nums):',
  '    total = sum(nums)',
  '    reach = [False] * (total + 1)',
  '    reach[0] = True',
  '    for x in nums:',
  '        for s in range(total, x - 1, -1):',
  '            if reach[s - x]:',
  '                reach[s] = True',
  '    result = 0',
  '    for s in range(total + 1):',
  '        if reach[s]:',
  '            result |= s',
  '    return result',
]
export const python = `${PY.join('\n')}\n`

const L = key => {
  const found = code.findIndex(c => c.text.includes(key))
  if (found < 0) throw new Error(`Missing pseudocode line: ${key}`)
  return found + 1
}
const P = key => {
  const found = PY.findIndex(line => line.includes(key))
  if (found < 0) throw new Error(`Missing python line: ${key}`)
  return found + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a nums list.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 6) throw new Error('nums has 1 to 6 numbers for the visualization.')
  if (nums.some(x => !Number.isInteger(x) || x < 0 || x > 9)) throw new Error('Each number is a whole number from 0 to 9.')
  if (nums.reduce((a, b) => a + b, 0) > 54) throw new Error('The sum of nums is at most 54 for the visualization.')
  return { nums }
}

export function buildTrace({ nums }) {
  const total = nums.reduce((a, b) => a + b, 0)
  const reach = Array(total + 1).fill(false)
  reach[0] = true
  const frames = []
  let result = 0
  const F = (phase, codeKey, pyKey, message, state) => frames.push({
    phase, activeLine: L(codeKey), pythonLine: P(pyKey), message, result, total, reach: reach.slice(), ...state,
  })
  F('setup', 'total is the sum', 'total = sum(nums)', `Every sum from 0 to ${total} is a candidate; only 0 is reachable with no numbers chosen.`, { x: -1, s: -1, marked: -1, folded: -1 })
  F('setup', 'reach[0] is true', 'reach[0] = True', 'The empty subsequence gives sum 0.', { x: -1, s: -1, marked: -1, folded: -1 })
  for (const x of nums) {
    F('item', 'for each number x', 'for x in nums', `Add ${x} to the choices: each sum may now include it or skip it.`, { x, s: -1, marked: -1, folded: -1 })
    for (let s = total; s >= x; s--) {
      const reachable = reach[s - x]
      if (reachable && !reach[s]) {
        reach[s] = true
        F('mark', 'if sum s minus x is reachable', 'if reach[s - x]', `Sum ${s - x} is reachable, so sum ${s} becomes reachable by adding ${x}.`, { x, s, marked: s, folded: -1 })
      } else {
        F('check', 'for each sum s from total', 'for s in range(total, x - 1, -1)', reachable
          ? `Sum ${s} was already reachable.`
          : `Sum ${s - x} is not reachable, so sum ${s} stays as it is.`, { x, s, marked: -1, folded: -1 })
      }
    }
  }
  result = 0
  F('fold', 'result is 0', 'result = 0', 'Start the OR with 0.', { x: -1, s: -1, marked: -1, folded: -1 })
  for (let s = 0; s <= total; s++) {
    if (!reach[s]) continue
    result |= s
    F('fold', 'for each reachable sum s', 'result |= s', `Reachable sum ${s} (binary ${s.toString(2)}) joins the OR, giving ${result}.`, { x: -1, s: -1, marked: -1, folded: s })
  }
  F('done', 'return result', 'return result', `The bitwise OR of all subsequence sums is ${result}.`, { x: -1, s: -1, marked: -1, folded: -1, result })
  return { input: { nums }, result, frames }
}
