export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > 200) throw new Error('Enter a single integer n between 1 and 200 (the visualization caps n at 200).')
  return n
}
export function buildTrace(n) {
  let res = [1]
  const frames = [{ phase: 'start', activeLine: L('Start with res = [1]'), pythonLine: 2, res: [...res], round: 0, message: 'Start with [1], which is trivially beautiful.' }]
  let round = 0
  while (res.length < n) {
    round++
    const odds = res.map(x => 2 * x - 1), evens = res.map(x => 2 * x)
    res = [...odds, ...evens]
    frames.push({ phase: 'expand', activeLine: L('set res to odds followed by evens'), pythonLine: 4, res: [...res], round, odds: odds.length,
      message: `Round ${round}: map the old array to odds (2x-1) and evens (2x). An odd plus an even is odd, so no mean 2*nums[k] (even) can sit between an odd and an even endpoint; each half keeps its own beauty.` })
  }
  const result = res.filter(x => x <= n)
  frames.push({ phase: 'filter', activeLine: L('return the elements of res'), pythonLine: 5, res: [...res], round, kept: [...result],
    message: `Drop values above ${n}. Removing elements from a beautiful array keeps it beautiful.` })
  frames.push({ phase: 'done', activeLine: L('return the elements of res'), pythonLine: 5, res: [...result], round, kept: [...result], message: `Beautiful array: [${result.join(', ')}].` })
  return { input: n, result, frames }
}
export const code = `Start with res = [1], which is trivially beautiful
while the length of res is less than n
  let odds be each x in res mapped to 2 * x - 1
  let evens be each x in res mapped to 2 * x
  set res to odds followed by evens
return the elements of res that are at most n`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def beautiful_array(n):
    res = [1]
    while len(res) < n:
        res = [2 * x - 1 for x in res] + [2 * x for x in res]
    return [x for x in res if x <= n]`
