export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data.num !== 'string' || data.num.length < 1 || data.num.length > 30 || !/^[0-9]+$/.test(data.num)) throw new Error('Use a string num of 1 to 30 decimal digits.')
  return { num: data.num }
}

export function buildTrace({ num }) {
  const counts = Array(10).fill(0)
  const frames = [{ phase: 'start', activeLine: L('count how many times each digit'), index: -1, counts: [], half: '', middle: '', message: `Read the digits of ${num}.` }]
  for (let i = 0; i < num.length; i++) {
    counts[Number(num[i])]++
    frames.push({ phase: 'count', activeLine: L('count how many times each digit'), index: i, counts: counts.map((c, d) => [d, c]), half: '', middle: '', message: `Digit ${num[i]} is counted.` })
  }
  let half = ''
  for (let d = 9; d >= 0; d--) {
    half += String(d).repeat(Math.floor(counts[d] / 2))
    frames.push({ phase: 'pair', activeLine: L('build the half'), index: -1, counts: counts.map((c, x) => [x, c]), half, middle: '', key: d, message: `Digit ${d} contributes ${Math.floor(counts[d] / 2)} pair(s) to the half.` })
  }
  let middle = ''
  for (let d = 9; d >= 0; d--) {
    if (counts[d] % 2 === 1) { middle = String(d); break }
  }
  frames.push({ phase: 'middle', activeLine: L('find the largest digit with an odd'), index: -1, counts: counts.map((c, x) => [x, c]), half, middle, key: middle === '' ? null : Number(middle), message: middle === '' ? 'No digit has an odd count, so the middle is empty.' : `The largest odd-count digit ${middle} goes in the middle.` })
  let result
  if (half.replace(/0/g, '') === '') {
    result = middle !== '' && middle !== '0' ? middle : '0'
    frames.push({ phase: 'zeros', activeLine: L('if the half has no digit above zero'), index: -1, counts: counts.map((c, x) => [x, c]), half, middle, result, message: `The half has no digit above zero, so the answer is ${result}.` })
  } else {
    result = half + middle + [...half].reverse().join('')
    frames.push({ phase: 'build', activeLine: L('return the half, then'), index: -1, counts: counts.map((c, x) => [x, c]), half, middle, result, message: `Mirror the half around the middle to get ${result}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the half, then'), index: -1, counts: counts.map((c, x) => [x, c]), half, middle, result, message: `Largest palindrome: ${result}.` })
  return { input: { num }, result, frames }
}

export const code = `largest palindromic number from the digits of num
  count how many times each digit 0 to 9 appears
  build the half made of pairs, from 9 down to 0
  find the largest digit with an odd count to be the middle
  if the half has no digit above zero then
    return the middle if it is above zero, otherwise return zero
  return the half, then the middle, then the half reversed`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def largest_palindromic_number(num):
    counts = [0] * 10
    for ch in num:
        counts[int(ch)] += 1
    half = ''.join(str(d) * (counts[d] // 2) for d in range(9, -1, -1))
    middle = ''
    for d in range(9, -1, -1):
        if counts[d] % 2 == 1:
            middle = str(d)
            break
    if half.strip('0') == '':
        return middle if middle not in ('', '0') else '0'
    return half + middle + half[::-1]
`
