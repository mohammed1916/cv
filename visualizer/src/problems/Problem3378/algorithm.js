export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums, threshold } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8) throw new Error('Use "nums" as an array of 1 to 8 integers.')
  if (nums.some(x => !Number.isInteger(x) || x < 1 || x > 30)) throw new Error('Each number is an integer from 1 to 30.')
  if (new Set(nums).size !== nums.length) throw new Error('Numbers in nums are unique.')
  if (!Number.isInteger(threshold) || threshold < 1 || threshold > 60) throw new Error('"threshold" is an integer from 1 to 60.')
  return { nums, threshold }
}

const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a }

export function buildTrace({ nums, threshold }) {
  const parent = nums.map((_, i) => i)
  const find = x => { while (parent[x] !== x) x = parent[x]; return x }
  const roots = () => nums.map((_, i) => nums[find(i)])
  let groups = nums.length
  const frames = [{ phase: 'start', activeLine: L('give every number its own group'), pair: null, lcm: null, roots: roots(), groups, message: `${nums.length} numbers, each in its own group.` }]
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      const a = nums[i]
      const b = nums[j]
      const l = (a / gcd(a, b)) * b
      const linked = l <= threshold
      if (linked) {
        const ri = find(i)
        const rj = find(j)
        if (ri !== rj) { parent[ri] = rj; groups-- }
      }
      frames.push({ phase: 'pair', activeLine: L('compute the lcm'), pair: [i, j], lcm: l, linked, roots: roots(), groups, message: `lcm(${a}, ${b}) = ${l} ${linked ? 'is within' : 'is above'} ${threshold}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return groups'), pair: null, lcm: null, roots: roots(), groups, message: `${groups} connected components.` })
  return { input: { nums, threshold }, result: groups, frames }
}

export const code = `count connected components, where two numbers are linked when their lcm is at most threshold
  give every number its own group
  set groups to the count of numbers
  for each pair i less than j
    compute the lcm of nums[i] and nums[j] as a times b divided by their gcd
    if the lcm is at most threshold then merge the two groups and subtract 1 from groups
  return groups`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from math import gcd

def count_components(nums, threshold):
    parent = list(range(len(nums)))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    groups = len(nums)
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            a, b = nums[i], nums[j]
            if a // gcd(a, b) * b <= threshold:
                ri, rj = find(i), find(j)
                if ri != rj:
                    parent[ri] = rj
                    groups -= 1
    return groups
`
