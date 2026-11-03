const L = s => code.findIndex(c => c.text.includes(s)) + 1
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with num and sum.')
  const { num, sum } = input
  if (!Number.isInteger(num) || num < 1 || num > 50) throw new Error('num is an integer from 1 to 50.')
  if (!Number.isInteger(sum) || sum < 1 || sum > 450) throw new Error('sum is an integer from 1 to 450.')
  return { num, sum }
}

export function buildTrace({ num, sum }) {
  const frames = []
  if (sum > 9 * num) {
    frames.push({ pythonLine: PY('if total > 9'), phase: 'check', activeLine: L('no number'), digits: [], message: `${num} digits can reach at most ${9 * num}, so no good integer exists.` })
    frames.push({ pythonLine: PY('return ""'), phase: 'done', activeLine: L('return'), digits: [], message: 'The answer is the empty string.' })
    return { input: { num, sum }, result: '', frames }
  }
  const nines = Math.floor(sum / 9)
  const rest = sum % 9
  const digits = Array(nines).fill(9)
  frames.push({ pythonLine: PY('nines = '), phase: 'fill', activeLine: L('as many 9s'), digits: [...digits], message: `Place ${nines} nine${nines === 1 ? '' : 's'} first.` })
  if (rest) {
    digits.push(rest)
    frames.push({ pythonLine: PY('if rest'), phase: 'fill', activeLine: L('leftover'), digits: [...digits], message: `Place the leftover digit ${rest} next.` })
  }
  while (digits.length < num) digits.push(0)
  frames.push({ pythonLine: PY('digits += '), phase: 'fill', activeLine: L('zeros'), digits: [...digits], message: 'Fill the remaining positions with 0.' })
  const result = digits.join('')
  frames.push({ pythonLine: PY('return "".join'), phase: 'done', activeLine: L('return'), digits: [...digits], message: `Answer: ${result}.` })
  return { input: { num, sum }, result, frames }
}

export const code = [
  'largest good integer with the maximum square-digit score',
  '  if sum is more than 9 times num, no number exists',
  '  place as many 9s as the sum allows',
  '  place the leftover digit next',
  '  fill the remaining positions with 0',
  '  return the digits in descending order',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def maximize_square_digits(num, total):
    if total > 9 * num:
        return ""
    nines = total // 9
    rest = total % 9
    digits = [9] * nines
    if rest:
        digits.append(rest)
    digits += [0] * (num - len(digits))
    return "".join(map(str, digits))
`
