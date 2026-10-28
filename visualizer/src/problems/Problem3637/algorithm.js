export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 12 || nums.some(v => !Number.isInteger(v) || v < -1000 || v > 1000)) throw new Error('Use 3 to 12 integers from -1000 to 1000.')
  return nums
}

export function buildTrace(nums) {
  const n = nums.length
  const frames = [{ phase: 'start', activeLine: L('set p to the end'), p: 0, q: 0, message: 'A trionic array rises, then falls, then rises again, with strict steps.' }]
  let p = 0
  while (p + 1 < n && nums[p] < nums[p + 1]) p++
  frames.push({ phase: 'rise', activeLine: L('set p to the end'), p, q: p, message: `The first strictly increasing run ends at index ${p}.` })
  let q = p
  while (q + 1 < n && nums[q] > nums[q + 1]) q++
  frames.push({ phase: 'fall', activeLine: L('set q to the end'), p, q, message: `The strictly decreasing run from ${p} ends at index ${q}.` })
  let answer = false
  if (0 < p && p < q && q < n - 1) {
    answer = true
    for (let i = q; i < n - 1; i++) if (!(nums[i] < nums[i + 1])) { answer = false; break }
  }
  frames.push({ phase: 'tail', activeLine: L('check the tail'), p, q, message: answer ? 'The tail from q strictly increases, so the array is trionic.' : 'The shape fails: either a boundary is misplaced or the tail does not strictly increase.' })
  frames.push({ phase: 'done', activeLine: L('return the answer'), p, q, message: `Trionic: ${answer}.` })
  return { input: nums, result: answer, frames }
}

export const code = `check whether the array is trionic:
  set p to the end of the first strictly increasing run
  set q to the end of the strictly decreasing run that starts at p
  set the answer to false
  if 0 < p < q < the last index then check the tail
    if every step after q strictly increases then set the answer to true
  return the answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def is_trionic(nums):
    n = len(nums)
    p = 0
    while p + 1 < n and nums[p] < nums[p + 1]:
        p += 1
    q = p
    while q + 1 < n and nums[q] > nums[q + 1]:
        q += 1
    answer = False
    if 0 < p < q < n - 1:
        if all(nums[i] < nums[i + 1] for i in range(q, n - 1)):
            answer = True
    return answer
`
