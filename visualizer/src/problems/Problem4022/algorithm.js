export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with k.')
  const { k } = input
  if (!Number.isSafeInteger(k) || k < 1 || k > 1e15) throw new Error('k is an integer from 1 to 1000000000000000.')
  return { k }
}

const lineOf = (list, text) => {
  const i = list.findIndex(c => c.text.includes(text))
  if (i < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return i + 1
}

// Block b holds the numbers 10b to 10b+9; block 0 holds 1 to 9 and is read ascending.
// Even blocks are read ascending and odd blocks descending.
export function buildTrace({ k: target }) {
  const frames = []
  const L = t => lineOf(code, t)
  const P = t => lineOf(PY, t)
  let k = target
  frames.push({ phase: 'start', activeLine: L('if k is at most 9'), pythonLine: P('if k <= 9'), k, d: null, block: null, number: null, digit: null, skipped: [], result: null, message: `Find the digit at position ${target}.` })

  if (k <= 9) {
    frames.push({ phase: 'done', activeLine: L('return k'), pythonLine: P('return k'), k, d: null, block: 0, number: k, digit: k, skipped: [], result: k, message: `Block 0 reads 1 to 9 ascending, so the digit is ${k}.` })
    return { input: { k: target }, result: k, frames }
  }
  k -= 9
  frames.push({ phase: 'short', activeLine: L('k = k minus 9'), pythonLine: P('k -= 9'), k, d: null, block: 0, number: null, digit: null, skipped: [], result: null, message: `Block 0 has 9 digits. ${k} digits remain after it.` })

  let d = 2
  const skipped = []
  while (true) {
    const group = 9 * 10 ** (d - 1) * d
    if (k > group) {
      skipped.push({ d, digits: group })
      frames.push({ phase: 'skip', activeLine: L('if k is larger than group'), pythonLine: P('if k > group'), k, d, block: null, number: null, digit: null, skipped: [...skipped], result: null, message: `All ${d}-digit numbers fill ${group} digits. Skip them: ${k - group} left.` })
      k -= group
      d += 1
    } else {
      frames.push({ phase: 'group', activeLine: L('group digits = count'), pythonLine: P('group = 9 *'), k, d, block: null, number: null, digit: null, skipped: [...skipped], result: null, message: `The position falls among the ${d}-digit numbers, with ${k} digits left in that group.` })
      break
    }
  }

  const firstBlock = 10 ** (d - 2)
  const block = firstBlock + Math.floor((k - 1) / (10 * d))
  frames.push({ phase: 'block', activeLine: L('block = first block'), pythonLine: P('block = first_block'), k, d, block, number: null, digit: null, skipped: [...skipped], result: null, message: `Block ${block} contains the position.` })

  const within = (k - 1) % (10 * d)
  const m = Math.floor(within / d)
  const t = within % d
  const number = 10 * block + (block % 2 === 1 ? 9 - m : m)
  frames.push({ phase: 'number', activeLine: L('number = 10 times block'), pythonLine: P('number = 10 * block'), k, d, block, number, digit: null, skipped: [...skipped], result: null, message: `Block ${block} is ${block % 2 === 1 ? 'odd, read descending' : 'even, read ascending'}; the number is ${number}.` })

  const digit = Number(String(number)[t])
  frames.push({ phase: 'done', activeLine: L('return the digit'), pythonLine: P('return int('), k, d, block, number, digit, skipped: [...skipped], result: digit, message: `Digit ${t + 1} of ${number} is ${digit}.` })
  return { input: { k: target }, result: digit, frames }
}

export const code = `digit at one-based position k of the infinite string
if k is at most 9 then return k
k = k minus 9
d = 2
while true
  group digits = count of d-digit numbers times d
  if k is larger than group digits then subtract them and let d grow by one
  else stop
first block = 10 to the power of (d minus 2)
block = first block plus floor((k minus 1) divided by 10 times d)
within = (k minus 1) modulo 10 times d
m = floor(within divided by d) and t = within modulo d
number = 10 times block, plus 9 minus m if block is odd else m
return the digit t of number`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def kth_digit(k):
    if k <= 9:
        return k
    k -= 9
    d = 2
    while True:
        group = 9 * 10 ** (d - 1) * d
        if k > group:
            k -= group
            d += 1
        else:
            break
    first_block = 10 ** (d - 2)
    block = first_block + (k - 1) // (10 * d)
    within = (k - 1) % (10 * d)
    m = within // d
    t = within % d
    number = 10 * block + (9 - m if block % 2 == 1 else m)
    return int(str(number)[t])
`
const PY = python.split('\n').map((text, index) => ({ line: index + 1, text }))
