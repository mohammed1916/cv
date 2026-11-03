const CODE = [
  'count substrings whose zeros and ones are in the ratio num1 to num2',
  'seen starts with key 0 counted once',
  'key is 0 and answer is 0',
  'for each character ch in s',
  '  if ch is 0, key increases by num2',
  '  otherwise key decreases by num1',
  '  add the number of earlier prefixes with this key to answer',
  '  count this prefix key once more',
  'return answer',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))

const PY = [
  'def count_fixed_ratio(s, num1, num2):',
  '    seen = {0: 1}',
  '    key = 0',
  '    answer = 0',
  '    for ch in s:',
  "        if ch == '0':",
  '            key += num2',
  '        else:',
  '            key -= num1',
  '        answer += seen.get(key, 0)',
  '        seen[key] = seen.get(key, 0) + 1',
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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s, num1 and num2.')
  const { s, num1, num2 } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 40 || !/^[01]+$/.test(s)) throw new Error('s is a binary string of 1 to 40 characters.')
  if (!Number.isInteger(num1) || num1 < 1 || num1 > 9) throw new Error('num1 is an integer from 1 to 9.')
  if (!Number.isInteger(num2) || num2 < 1 || num2 > 9) throw new Error('num2 is an integer from 1 to 9.')
  return { s, num1, num2 }
}

export function buildTrace({ s, num1, num2 }) {
  // The key of a prefix is zeros * num2 - ones * num1. Two prefixes give a fixed-ratio
  // substring exactly when their keys match.
  const keys = [0]
  for (const ch of s) keys.push(keys[keys.length - 1] + (ch === '0' ? num2 : -num1))
  const frames = []
  const seen = new Map([[0, 1]])
  let key = 0
  let answer = 0
  const snapSeen = () => [...seen.entries()].map(([k, count]) => ({ key: k, count }))
  const F = (phase, codeKey, pyKey, message, state) => frames.push({
    phase, activeLine: L(codeKey), pythonLine: P(pyKey), message, answer, key, keys, ...state,
  })
  F('start', 'seen starts with key 0', 'seen = {0: 1}', 'The empty prefix has key 0 and is counted once.', { r: 0, ch: '', matches: [], seen: snapSeen() })
  F('start', 'key is 0 and answer', 'key = 0', 'Start the running key at 0 with no substrings counted.', { r: 0, ch: '', matches: [], seen: snapSeen() })
  for (let r = 1; r <= s.length; r++) {
    const ch = s[r - 1]
    key = keys[r]
    F('step', 'for each character ch', 'for ch in s', `Read character ${r} (${ch}).`, { r, ch, matches: [], seen: snapSeen() })
    if (ch === '0') {
      F('step', 'if ch is 0, key increases', "if ch == '0'", `A 0 adds num2 = ${num2} to the key, giving ${key}.`, { r, ch, matches: [], seen: snapSeen() })
    } else {
      F('step', 'otherwise key decreases', 'key -= num1', `A 1 subtracts num1 = ${num1} from the key, giving ${key}.`, { r, ch, matches: [], seen: snapSeen() })
    }
    const matches = []
    for (let l = 0; l < r; l++) if (keys[l] === key) matches.push(l)
    answer += seen.get(key) ?? 0
    F('count', 'add the number of earlier prefixes', 'answer += seen.get', `${seen.get(key) ?? 0} earlier prefix${(seen.get(key) ?? 0) === 1 ? '' : 'es'} share key ${key}, so ${seen.get(key) ?? 0} substring${(seen.get(key) ?? 0) === 1 ? '' : 's'} end here.`, { r, ch, matches, seen: snapSeen() })
    seen.set(key, (seen.get(key) ?? 0) + 1)
    F('store', 'count this prefix key once more', 'seen[key] = seen.get', `Count key ${key} once more for later substrings.`, { r, ch, matches, seen: snapSeen() })
  }
  F('done', 'return answer', 'return answer', `Total fixed-ratio substrings: ${answer}.`, { r: s.length, ch: '', matches: [], seen: snapSeen() })
  return { input: { s, num1, num2 }, result: answer, frames }
}
