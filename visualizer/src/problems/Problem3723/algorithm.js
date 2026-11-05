
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
    frames.push({ pythonLine: P('if total > 9'), phase: 'check', activeLine: L('if (sum > 9'), digits: [], message: `${num} digits can reach at most ${9 * num}, so no good integer exists.` })
    frames.push({ pythonLine: P('return ""'), phase: 'done', activeLine: L('return digits'), digits: [], message: 'The answer is the empty string.' })
    return { input: { num, sum }, result: '', frames }
  }
  const nines = Math.floor(sum / 9)
  const rest = sum % 9
  const digits = Array(nines).fill(9)
  frames.push({ pythonLine: P('nines = '), phase: 'fill', activeLine: L('const nines'), digits: [...digits], message: `Place ${nines} nine${nines === 1 ? '' : 's'} first.` })
  if (rest) {
    digits.push(rest)
    frames.push({ pythonLine: P('if rest'), phase: 'fill', activeLine: L('if (rest)'), digits: [...digits], message: `Place the leftover digit ${rest} next.` })
  }
  while (digits.length < num) digits.push(0)
  frames.push({ pythonLine: P('digits += '), phase: 'fill', activeLine: L('while (digits.length'), digits: [...digits], message: 'Fill the remaining positions with 0.' })
  const result = digits.join('')
  frames.push({ pythonLine: P('return "".join'), phase: 'done', activeLine: L('return digits'), digits: [...digits], message: `Answer: ${result}.` })
  return { input: { num, sum }, result, frames }
}

export const code = `function maximizeSquaresOfDigits(num, sum) {
  if (sum > 9 * num) return ''
  const nines = Math.floor(sum / 9)
  const rest = sum % 9
  const digits = Array(nines).fill(9)
  if (rest) digits.push(rest)
  while (digits.length < num) digits.push(0)
  return digits.join('')
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const hit = code.find(c => c.text.includes(s))
  if (!hit) throw new Error(`No JavaScript line contains "${s}".`)
  return hit.line
}
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`No Python line contains "${s}".`)
  return index + 1
}

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
