export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || typeof data.num !== 'string') throw new Error('Use an object such as {"num":"25??"}.')
  const { num } = data
  if (num.length < 2 || num.length > 8 || num.length % 2 !== 0) throw new Error('num has an even length from 2 to 8.')
  if (![...num].every(c => c === '?' || (c >= '0' && c <= '9'))) throw new Error('num holds only digits and ? characters.')
  return { num }
}

const digitSum = s => [...s].reduce((total, c) => (c === '?' ? total : total + Number(c)), 0)
const marks = s => [...s].filter(c => c === '?').length

export function buildTrace({ num }) {
  const half = num.length / 2
  const left = num.slice(0, half)
  const right = num.slice(half)
  const cl = marks(left)
  const cr = marks(right)
  const sl = digitSum(left)
  const sr = digitSum(right)
  const odd = (cl + cr) % 2 === 1
  const result = odd ? true : 2 * (sl - sr) !== 9 * (cr - cl)
  const frames = [
    { phase: 'start', activeLine: L('split num into'), cursor: -1, stats: null, message: `Split ${num} into two halves of ${half} characters.` },
    { phase: 'count', activeLine: L('count the question marks'), cursor: -1, stats: { cl, cr, sl, sr }, message: `Left: ${cl} question marks, digit sum ${sl}. Right: ${cr} question marks, digit sum ${sr}.` },
  ]
  if (odd) {
    frames.push({ phase: 'parity', activeLine: L('if cl plus cr is odd'), cursor: -1, stats: { cl, cr, sl, sr }, message: `There are ${cl + cr} question marks, an odd count, so Alice fills the last one and wins.` })
  } else {
    frames.push({ phase: 'compare', activeLine: L('if 2 times'), cursor: -1, stats: { cl, cr, sl, sr }, message: `Compare 2 times (${sl} minus ${sr}) with 9 times (${cr} minus ${cl}). They ${result ? 'differ' : 'are equal'}.` })
  }
  frames.push({ phase: 'done', activeLine: L(result ? 'return true' : 'return false'), cursor: -1, stats: { cl, cr, sl, sr }, message: `Alice ${result ? 'wins' : 'loses'}.` })
  return { input: { num }, result, frames }
}

export const code = `alice wins the sum game:
  split num into a left half and a right half
  count the question marks on the left as cl and on the right as cr
  add the known digits on the left as sl and on the right as sr
  if cl plus cr is odd then
    return true
  if 2 times (sl minus sr) equals 9 times (cr minus cl) then
    return false
  return true`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sum_game_alice_wins(num):
    half = len(num) // 2
    left, right = num[:half], num[half:]
    cl = left.count('?')
    cr = right.count('?')
    sl = sum(int(c) for c in left if c != '?')
    sr = sum(int(c) for c in right if c != '?')
    if (cl + cr) % 2 == 1:
        return True
    return 2 * (sl - sr) != 9 * (cr - cl)
`
