export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums.')
  const { nums } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 100) throw new Error('nums must be an array of 1 to 100 [start, end] pairs.')
  if (nums.some(p => !Array.isArray(p) || p.length !== 2 || !p.every(v => Number.isInteger(v)))) throw new Error('Each car is a [start, end] pair of integers.')
  if (nums.some(([s, e]) => s < 1 || e > 100 || s > e)) throw new Error('Each pair needs 1 <= start <= end <= 100.')
  return { nums }
}

export function buildTrace(input) {
  const { nums } = input
  const diff = new Array(102).fill(0)
  const frames = [{ phase: 'start', activeLine: L('set diff to zeros'), point: null, running: 0, count: 0, covered: [], message: 'Count the points from 1 to 100 that some car covers.' }]
  for (const [start, end] of nums) {
    diff[start] += 1
    diff[end + 1] -= 1
    frames.push({ phase: 'mark', activeLine: L('add 1 to diff at start'), point: null, running: 0, count: 0, covered: [], message: `Car [${start}, ${end}] adds 1 at ${start} and removes it after ${end}.` })
  }
  let running = 0
  let count = 0
  const covered = []
  for (let p = 1; p <= 100; p++) {
    running += diff[p]
    if (running > 0) {
      count++
      covered.push(p)
    }
    frames.push({ phase: 'sweep', activeLine: L('if running is above 0'), point: p, running, count, covered: covered.slice(), message: `Point ${p} is covered by ${running} car${running === 1 ? '' : 's'}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return count'), point: null, running: 0, count, covered: covered.slice(), message: `Points covered: ${count}.` })
  return { input, result: count, frames }
}

export const code = `count the integer points covered by at least one car
  set diff to zeros for the points 0 through 101
  for each car [start, end]
    add 1 to diff at start and subtract 1 at end plus 1
  set running to 0 and count to 0
  for each point p from 1 to 100
    add diff at p to running
    if running is above 0 then add 1 to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def number_of_points(nums):
    diff = [0] * 102
    for start, end in nums:
        diff[start] += 1
        diff[end + 1] -= 1

    running = 0
    count = 0
    for p in range(1, 101):
        running += diff[p]
        if running > 0:
            count += 1
    return count
`
