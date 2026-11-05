export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums, k } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 16 || nums.some(v => !Number.isInteger(v) || v < 1 || v > 10000)) throw new Error('nums must be 1–16 integers from 1 to 10,000 (the search places every number).')
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k must be an integer from 1 to the length of nums.')
  return { nums, k }
}

// The bucket sum must be total / k. Place the largest numbers first and backtrack when a bucket cannot take one.
// Buckets with equal sums are interchangeable, so only the first of them is tried.
export function buildTrace({ nums, k }) {
  const total = nums.reduce((a, b) => a + b, 0)
  const sorted = [...nums].sort((a, b) => b - a)
  const frames = [{ phase: 'start', index: null, sums: Array(k).fill(0), target: null, bucket: null, activeLine: L('const total = '), pythonLine: P('total = sum('), message: 'Split the numbers into k buckets with equal sums.' }]
  if (total % k !== 0) {
    frames.push({ phase: 'done', index: null, sums: Array(k).fill(0), target: null, bucket: null, result: false, activeLine: L('if (total % k'), pythonLine: P('if total % k'), message: `Total ${total} does not split into ${k} equal parts.` })
    return { input: { nums, k }, result: false, frames }
  }
  const target = total / k
  if (sorted[0] > target) {
    frames.push({ phase: 'done', index: null, sums: Array(k).fill(0), target, bucket: null, result: false, activeLine: L('if (sorted[0] > target)'), pythonLine: P('if ordered[0] > target'), message: `${sorted[0]} is larger than the target ${target}.` })
    return { input: { nums, k }, result: false, frames }
  }
  const sums = Array(k).fill(0)
  frames[0].target = target
  const place = i => {
    if (i === sorted.length) return sums.every(s => s === target)
    for (let b = 0; b < k; b++) {
      if (sums[b] + sorted[i] > target) continue
      if (b > 0 && sums[b] === sums[b - 1]) continue
      sums[b] += sorted[i]
      frames.push({ phase: 'place', index: i, sums: [...sums], target, bucket: b, activeLine: L('sums[b] += sorted[i]'), pythonLine: P('sums[b] += ordered[i]'), message: `Put ${sorted[i]} into bucket ${b + 1}: sum ${sums[b]} of ${target}.` })
      if (place(i + 1)) return true
      sums[b] -= sorted[i]
      frames.push({ phase: 'undo', index: i, sums: [...sums], target, bucket: b, activeLine: L('sums[b] -= sorted[i]'), pythonLine: P('sums[b] -= ordered[i]'), message: `Bucket ${b + 1} cannot finish with ${sorted[i]}: take it back out.` })
    }
    return false
  }
  const result = place(0)
  frames.push({ phase: 'done', index: null, sums: [...sums], target, bucket: null, result, activeLine: L('return place(0)'), pythonLine: P('return place(0)'), message: result ? 'Every bucket reached the target.' : 'No assignment reaches the target in every bucket.' })
  return { input: { nums, k }, result, frames }
}

const SOURCE = `function canPartitionKSubsets(nums, k) {
  const total = nums.reduce((a, b) => a + b, 0)
  if (total % k !== 0) return false
  const target = total / k
  const sorted = [...nums].sort((a, b) => b - a)
  if (sorted[0] > target) return false
  const sums = Array(k).fill(0)
  const place = i => {
    if (i === sorted.length) return sums.every(s => s === target)
    for (let b = 0; b < k; b++) {
      if (sums[b] + sorted[i] > target) continue
      if (b > 0 && sums[b] === sums[b - 1]) continue
      sums[b] += sorted[i]
      if (place(i + 1)) return true
      sums[b] -= sorted[i]
    }
    return false
  }
  return place(0)
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def can_partition_k_subsets(nums, k):
    total = sum(nums)
    if total % k != 0:
        return False
    target = total // k
    ordered = sorted(nums, reverse=True)
    if ordered[0] > target:
        return False
    sums = [0] * k

    def place(i):
        if i == len(ordered):
            return all(s == target for s in sums)
        for b in range(k):
            if sums[b] + ordered[i] > target:
                continue
            if b > 0 and sums[b] == sums[b - 1]:
                continue
            sums[b] += ordered[i]
            if place(i + 1):
                return True
            sums[b] -= ordered[i]
        return False

    return place(0)`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
