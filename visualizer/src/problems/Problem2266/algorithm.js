const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  const keys = data?.pressed_keys
  if (typeof keys !== 'string' || !/^[2-9]{1,12}$/.test(keys)) throw new Error('pressed_keys must be 1 to 12 digits from 2 to 9.')
  return { pressed_keys: keys }
}

export const code = `count text messages(pressed_keys)
  total = 1
  split pressed_keys into runs of equal digits
  for each run of length L with digit d
    limit = 4 if d is 7 or 9, otherwise 3
    ways[0] = 1
    for length from 1 to L
      ways[length] = sum of ways[length - k] for k from 1 to min(length, limit), modulo 1000000007
    total = total * ways[L] modulo 1000000007
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// A run of equal presses splits into groups of one to three presses, or one to four for 7 and 9.
export function buildTrace({ pressed_keys: keys }) {
  let total = 1
  const frames = [{ phase: 'start', start: -1, length: 0, ways: [], total, activeLine: L('total = 1'), message: 'With no presses there is exactly one way to write nothing.' }]
  let i = 0
  while (i < keys.length) {
    let j = i
    while (j < keys.length && keys[j] === keys[i]) j++
    const run = j - i
    const limit = keys[i] === '7' || keys[i] === '9' ? 4 : 3
    const ways = [1]
    for (let length = 1; length <= run; length++) {
      let sum = 0
      for (let k = 1; k <= Math.min(length, limit); k++) sum += ways[length - k]
      ways.push(sum % MOD)
    }
    frames.push({ phase: 'run', start: i, length: run, ways: [...ways], total, activeLine: L('ways[length] = sum'), message: `A run of ${run} presses of ${keys[i]} splits in ${ways[run]} ways (groups of at most ${limit}).` })
    total = (total * ways[run]) % MOD
    frames.push({ phase: 'multiply', start: i, length: run, ways: [...ways], total, activeLine: L('total = total * ways'), message: `Running total: ${total}.` })
    i = j
  }
  frames.push({ phase: 'done', start: -1, length: 0, ways: [], total, activeLine: L('return total'), message: `Text messages: ${total}.` })
  return { input: { pressed_keys: keys }, result: total, frames }
}

export const python = `def count_texts(pressed_keys):
    MOD = 1000000007
    total = 1
    i = 0
    while i < len(pressed_keys):
        j = i
        while j < len(pressed_keys) and pressed_keys[j] == pressed_keys[i]:
            j += 1
        run = j - i
        limit = 4 if pressed_keys[i] in '79' else 3
        ways = [1]
        for length in range(1, run + 1):
            ways.append(sum(ways[length - k] for k in range(1, min(length, limit) + 1)) % MOD)
        total = total * ways[run] % MOD
        i = j
    return total
`
