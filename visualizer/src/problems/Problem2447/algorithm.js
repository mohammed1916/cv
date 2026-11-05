export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 values.')
  if (!nums.every(x => Number.isInteger(x) && x >= 1 && x <= 24)) throw new Error('Each value is an integer from 1 to 24.')
  if (!Number.isInteger(k) || k < 1 || k > 24) throw new Error('k is an integer from 1 to 24.')
  return { nums, k }
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

export function buildTrace({ nums, k }) {
  const frames = []
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    let g = 0
    for (let j = i; j < nums.length; j++) {
      g = gcd(g, nums[j])
      if (g < k) {
        frames.push({ phase: 'stop', activeLine: CL('if (g < k)'), pythonLine: PL('if g < k'), l: i, r: j, g, count, message: `gcd of ${i}..${j} is ${g}, below ${k}. Longer subarrays from ${i} can only shrink it, so stop.` })
        break
      }
      const hit = g === k
      if (hit) count++
      frames.push({ phase: hit ? 'hit' : 'grow', activeLine: CL('if (g === k)'), pythonLine: PL('if g == k'), l: i, r: j, g, count, message: `gcd of ${i}..${j} is ${g}${hit ? ', equal to ' + k + ', so it counts' : ''}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: CL('return count'), pythonLine: PL('return count'), l: -1, r: -1, g: 0, count, message: `${count} subarrays have gcd ${k}.` })
  return { input: { nums, k }, result: count, frames }
}

export const code = `function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function countGcdSubarrays(nums, k) {
  let count = 0;
  for (let i = 0; i < nums.length; i++) {
    let g = 0;
    for (let j = i; j < nums.length; j++) {
      g = gcd(g, nums[j]);
      if (g < k) break;
      if (g === k) count++;
    }
  }
  return count;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `from math import gcd


def count_gcd_subarrays(nums, k):
    count = 0
    for i in range(len(nums)):
        g = 0
        for j in range(i, len(nums)):
            g = gcd(g, nums[j])
            if g < k:
                break
            if g == k:
                count += 1
    return count
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
