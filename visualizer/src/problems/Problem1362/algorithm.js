export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with num.')
  const { num } = input
  if (!Number.isInteger(num) || num < 1 || num > 1000000000) throw new Error('num must be an integer from 1 to 1000000000.')
  return { num }
}

// The divisor of target closest to its square root gives the pair with the smallest gap.
function closestPair(target) {
  let a = Math.floor(Math.sqrt(target))
  while (a * a > target) a -= 1
  while ((a + 1) * (a + 1) <= target) a += 1
  while (target % a !== 0) a -= 1
  return [a, target / a]
}

export function buildTrace({ num }) {
  const targets = [num + 1, num + 2]
  const frames = [{ phase: 'start', activeLine: L('set targets'), target: null, pairs: [], message: `Look for the closest factor pair of ${targets[0]} and of ${targets[1]}.` }]
  const pairs = []
  for (const target of targets) {
    const pair = closestPair(target)
    pairs.push(pair)
    frames.push({ phase: 'search', activeLine: L('search down from the square root'), target, pairs: pairs.slice(), message: `${target} = ${pair[0]} x ${pair[1]}, with a gap of ${pair[1] - pair[0]}.` })
  }
  const best = pairs[0][1] - pairs[0][0] <= pairs[1][1] - pairs[1][0] ? pairs[0] : pairs[1]
  frames.push({ phase: 'done', activeLine: L('return the pair'), target: null, pairs, message: `The closest pair is ${best[0]} and ${best[1]}.` })
  return { input: { num }, result: best, targets, pairs, frames }
}

export const code = `find two factors a and b with a times b equal to num plus 1 or num plus 2 and the smallest gap
read num from the input
set targets to num plus 1 and num plus 2
for each target do
  search down from the square root of the target for a divisor a
  set b to the target divided by a, which gives the pair
keep the pair with the smaller gap between its two factors
return the pair`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from math import isqrt

def closest_divisors(num):
    best = None
    for target in (num + 1, num + 2):
        a = isqrt(target)
        while target % a != 0:
            a -= 1
        pair = [a, target // a]
        if best is None or pair[1] - pair[0] < best[1] - best[0]:
            best = pair
    return best
`
