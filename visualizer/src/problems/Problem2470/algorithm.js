export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (nums.length < 1 || nums.length > 10) throw new Error('nums has 1 to 10 values.')
  if (!nums.every(x => Number.isInteger(x) && x >= 1 && x <= 12)) throw new Error('Each value is an integer from 1 to 12.')
  if (!Number.isInteger(k) || k < 1 || k > 24) throw new Error('k is an integer from 1 to 24.')
  return { nums, k }
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))
const lcm = (a, b) => (a / gcd(a, b)) * b

export function buildTrace({ nums, k }) {
  const frames = []
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    let l = 1
    for (let j = i; j < nums.length; j++) {
      if (k % nums[j] !== 0) {
        frames.push({ phase: 'stop', activeLine: CL('if (k % nums[j]'), pythonLine: PL('if k % nums[j]'), l: i, r: j, lcm: l, count, message: `${nums[j]} does not divide ${k}, so no subarray through ${j} can have LCM ${k}.` })
        break
      }
      l = lcm(l, nums[j])
      const hit = l === k
      if (hit) count++
      frames.push({ phase: hit ? 'hit' : 'grow', activeLine: CL('l = lcm(l, nums[j])'), pythonLine: PL('l = l * nums[j]'), l: i, r: j, lcm: l, count, message: `LCM of ${i}..${j} is ${l}${hit ? ', equal to ' + k + ', so it counts' : ''}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: CL('return count'), pythonLine: PL('return count'), l: -1, r: -1, lcm: 0, count, message: `${count} subarrays have LCM ${k}.` })
  return { input: { nums, k }, result: count, frames }
}

export const code = `function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function lcm(a, b) {
  return (a / gcd(a, b)) * b;
}

function countLcmSubarrays(nums, k) {
  let count = 0;
  for (let i = 0; i < nums.length; i++) {
    let l = 1;
    for (let j = i; j < nums.length; j++) {
      if (k % nums[j] !== 0) break;
      l = lcm(l, nums[j]);
      if (l === k) count++;
    }
  }
  return count;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `from math import gcd


def count_lcm_subarrays(nums, k):
    count = 0
    for i in range(len(nums)):
        l = 1
        for j in range(i, len(nums)):
            if k % nums[j] != 0:
                break
            l = l * nums[j] // gcd(l, nums[j])
            if l == k:
                count += 1
    return count
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
