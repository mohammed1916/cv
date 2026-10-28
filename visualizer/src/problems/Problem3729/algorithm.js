export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums) || !Number.isInteger(obj.k)) throw new Error('Use an object with a nums array and an integer k.')
  if (obj.nums.length < 1 || obj.nums.length > 12) throw new Error('Use 1 to 12 values for the visualization.')
  if (obj.nums.some((v, i) => !Number.isInteger(v) || v < 1 || v > 1000000000 || (i > 0 && v < obj.nums[i - 1]))) throw new Error('Values are integers from 1 to 1000000000 in non-decreasing order.')
  if (obj.k < 1 || obj.k > 1000000000) throw new Error('k is an integer from 1 to 1000000000.')
  return { nums: obj.nums, k: obj.k }
}

export function buildTrace(input) {
  const { nums, k } = input
  const groups = []
  for (const x of nums) {
    if (groups.length && groups[groups.length - 1].value === x) groups[groups.length - 1].count += 1
    else groups.push({ value: x, count: 1 })
  }
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('group equal values'), group: -1, total: 0, message: `Group equal values into ${groups.length} runs. A distinct subarray is a sequence of values, so count each shape once.` }]
  groups.forEach((g, gi) => {
    for (let c = 1; c <= g.count; c++) {
      if ((c * g.value) % k === 0) total += 1
    }
    frames.push({ phase: 'single', activeLine: L('for each run g'), group: gi, total, message: `Subarrays made only of ${g.value}: counted those whose length times ${g.value} is divisible by ${k}. Total: ${total}.` })
  })
  for (let i = 0; i < groups.length; i++) {
    let middle = 0
    for (let j = i + 1; j < groups.length; j++) {
      const gi = groups[i], gj = groups[j]
      for (let a = 1; a <= gi.count; a++) {
        for (let b = 1; b <= gj.count; b++) {
          if ((a * gi.value + middle + b * gj.value) % k === 0) total += 1
        }
      }
      frames.push({ phase: 'pair', activeLine: L('for each end run j'), group: j, total, message: `Runs ${gi.value} to ${gj.value}: partial ends with full runs between them. Total: ${total}.` })
      middle += gj.count * gj.value
    }
  }
  frames.push({ phase: 'done', activeLine: L('return total'), group: -1, total, message: `Distinct subarrays divisible by ${k}: ${total}.` })
  return { input, result: total, frames }
}

export const code = `count distinct subarrays divisible by k:
  group equal values into runs (value, count) in order
  set total to 0
  for each run g:
    for each length c from 1 to the count of g:
      if c times the value of g is divisible by k then add 1 to total
  for each start run i:
    set middle to 0
    for each end run j after i:
      for each a from 1 to count of run i, and each b from 1 to count of run j:
        if a times value i plus middle plus b times value j is divisible by k then add 1 to total
      add the full run j to middle
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_distinct_divisible_sorted(nums, k):
    groups = []
    for x in nums:
        if groups and groups[-1][0] == x:
            groups[-1][1] += 1
        else:
            groups.append([x, 1])
    total = 0
    for value, count in groups:
        for c in range(1, count + 1):
            if (c * value) % k == 0:
                total += 1
    for i in range(len(groups)):
        middle = 0
        for j in range(i + 1, len(groups)):
            vi, ci = groups[i]
            vj, cj = groups[j]
            for a in range(1, ci + 1):
                for b in range(1, cj + 1):
                    if (a * vi + middle + b * vj) % k == 0:
                        total += 1
            middle += cj * vj
    return total
`
