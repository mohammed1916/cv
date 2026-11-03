const MOD = 1000000007

const CODE = [
  'count good binary strings with length from minLength to maxLength',
  'ways[0] is 1, the empty string built in one way',
  'for each length i from 1 to maxLength',
  '  if i is at least zeroGroup, add ways of length i minus zeroGroup',
  '  if i is at least oneGroup, add ways of length i minus oneGroup',
  '  reduce ways[i] modulo the prime',
  'answer is 0',
  'for each length i from minLength to maxLength, add ways[i] to answer',
  'return answer',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))

const PY = [
  'def count_good_strings(min_length, max_length, zero_group, one_group):',
  '    MOD = 1000000007',
  '    ways = [0] * (max_length + 1)',
  '    ways[0] = 1',
  '    for i in range(1, max_length + 1):',
  '        if i >= zero_group:',
  '            ways[i] += ways[i - zero_group]',
  '        if i >= one_group:',
  '            ways[i] += ways[i - one_group]',
  '        ways[i] %= MOD',
  '    answer = 0',
  '    for i in range(min_length, max_length + 1):',
  '        answer = (answer + ways[i]) % MOD',
  '    return answer',
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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with min_length, max_length, zero_group and one_group.')
  const { min_length, max_length, zero_group, one_group } = input
  if (![min_length, max_length, zero_group, one_group].every(Number.isInteger)) throw new Error('All four parameters are whole numbers.')
  if (min_length < 1 || max_length > 30 || min_length > max_length) throw new Error('Use 1 <= min_length <= max_length <= 30 for the visualization.')
  if (zero_group < 1 || zero_group > 10 || one_group < 1 || one_group > 10) throw new Error('zero_group and one_group are from 1 to 10.')
  return { min_length, max_length, zero_group, one_group }
}

export function buildTrace({ min_length, max_length, zero_group, one_group }) {
  const ways = Array(max_length + 1).fill(0)
  ways[0] = 1
  const frames = []
  const F = (phase, codeKey, pyKey, message, state) => frames.push({
    phase, activeLine: L(codeKey), pythonLine: P(pyKey), message, ways: ways.slice(), min_length, max_length, zero_group, one_group, ...state,
  })
  F('setup', 'ways[0] is 1', 'ways[0] = 1', 'The empty string is the only string of length 0.', { i: 0, fromZero: null, fromOne: null, answer: null, summed: -1 })
  for (let i = 1; i <= max_length; i++) {
    F('length', 'for each length i from 1', 'for i in range(1, max_length + 1)', `Count the strings of length ${i} by their last block.`, { i, fromZero: null, fromOne: null, answer: null, summed: -1 })
    let fromZero = null
    let fromOne = null
    if (i >= zero_group) {
      fromZero = ways[i - zero_group]
      ways[i] += fromZero
      F('zero', 'if i is at least zeroGroup', 'ways[i] += ways[i - zero_group]', `Append a block of ${zero_group} zeros to the ${i - zero_group}-length strings: +${fromZero}.`, { i, fromZero, fromOne, answer: null, summed: -1 })
    }
    if (i >= one_group) {
      fromOne = ways[i - one_group]
      ways[i] += fromOne
      F('one', 'if i is at least oneGroup', 'ways[i] += ways[i - one_group]', `Append a block of ${one_group} ones to the ${i - one_group}-length strings: +${fromOne}.`, { i, fromZero, fromOne, answer: null, summed: -1 })
    }
    ways[i] %= MOD
    F('length', 'reduce ways[i] modulo', 'ways[i] %= MOD', `ways[${i}] = ${ways[i]} after reduction.`, { i, fromZero, fromOne, answer: null, summed: -1 })
  }
  let answer = 0
  F('sum', 'answer is 0', 'answer = 0', 'Start the total for the requested lengths at 0.', { i: -1, fromZero: null, fromOne: null, answer, summed: -1 })
  for (let i = min_length; i <= max_length; i++) {
    answer = (answer + ways[i]) % MOD
    F('sum', 'for each length i from minLength', 'answer = (answer + ways[i])', `Length ${i} contributes ${ways[i]}; running total ${answer}.`, { i: -1, fromZero: null, fromOne: null, answer, summed: i })
  }
  F('done', 'return answer', 'return answer', `Good strings with length in [${min_length}, ${max_length}]: ${answer}.`, { i: -1, fromZero: null, fromOne: null, answer, summed: -1 })
  return { input: { min_length, max_length, zero_group, one_group }, result: answer, frames }
}
