export function parseInput(text) {
  const nums = JSON.parse(text)
  const ok = Array.isArray(nums) && nums.length >= 1 && nums.length <= 300 && nums.every(Number.isInteger) && [...nums].sort((a, b) => a - b).every((v, i) => v === i)
  if (!ok) throw new Error('Enter a JSON permutation of 0..n-1 with 1-300 elements, e.g. [1,0,2] (visualization cap: 300).')
  return nums
}
export function buildTrace(nums) {
  const frames = [{ phase: 'start', activeLine: 1, pythonLine: 2, index: -1, offenders: [], message: 'Local inversions are adjacent and always global. Equal counts means there is no non-local inversion, which happens exactly when every |nums[i] - i| is at most 1.' }]
  const offenders = []
  for (let i = 0; i < nums.length; i++) {
    const dev = Math.abs(nums[i] - i)
    if (dev > 1) {
      offenders.push(i)
      frames.push({ phase: 'violation', activeLine: 3, pythonLine: 4, index: i, dev, offenders: [...offenders], message: `|${nums[i]} - ${i}| = ${dev} exceeds 1: value ${nums[i]} sits ${dev} slots from home, creating an inversion between non-adjacent positions. Return False.` })
      frames.push({ phase: 'done', activeLine: 4, pythonLine: 4, index: i, dev, offenders: [...offenders], message: 'Global inversions exceed local inversions: False.' })
      return { input: [...nums], result: false, frames }
    }
    frames.push({ phase: 'check', activeLine: 3, pythonLine: 3, index: i, dev, offenders: [], message: `|${nums[i]} - ${i}| = ${dev}, within 1: this value is at most one step from its sorted position.` })
  }
  frames.push({ phase: 'done', activeLine: 5, pythonLine: 5, index: nums.length - 1, dev: 0, offenders: [], message: 'Every value is within one slot of its home, so all inversions are local: True.' })
  return { input: [...nums], result: true, frames }
}
export const code = `for each index i from 0 to n - 1
  set dev to the absolute difference of nums[i] and i
  if dev is greater than 1 then
    return False
return True`.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def is_ideal_permutation(nums):
    for i, x in enumerate(nums):
        if abs(x - i) > 1:
            return False
    return True
`
