export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use a JSON array of 1 to 12 integers.')
  if (!nums.every(x => Number.isInteger(x) && x >= -1000 && x <= 1000)) throw new Error('Each value is an integer from -1000 to 1000.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  let arr = [...nums]
  let operations = 0
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('start with a copy'), at: -1, pair: null, arr: [...arr], operations, message: `Start with [${arr.join(', ')}].` })
  while (true) {
    const descent = arr.findIndex((x, i) => i < arr.length - 1 && x > arr[i + 1])
    frames.push({ pythonLine: 4, phase: 'check', activeLine: L('while some adjacent pair decreases'), at: descent, pair: null, arr: [...arr], operations,
      message: descent < 0 ? 'No adjacent pair decreases.' : `Index ${descent} is larger than its right neighbour.` })
    if (descent < 0) break
    let best = 0
    frames.push({ pythonLine: 5, phase: 'pick', activeLine: L('start the best pair'), at: 0, pair: [0, 1], arr: [...arr], operations, message: 'Assume the first pair has the smallest sum.' })
    for (let i = 1; i < arr.length - 1; i++) {
      const sum = arr[i] + arr[i + 1]
      const bestSum = arr[best] + arr[best + 1]
      if (sum < bestSum) {
        best = i
        frames.push({ pythonLine: 8, phase: 'pick', activeLine: L('remember this pair'), at: i, pair: [i, i + 1], arr: [...arr], operations, message: `Pair at ${i} has sum ${sum}, the new smallest.` })
      } else {
        frames.push({ pythonLine: 7, phase: 'scan', activeLine: L('if the sum of this pair'), at: i, pair: [i, i + 1], arr: [...arr], operations, message: `Pair at ${i} has sum ${sum}, not smaller than ${bestSum}.` })
      }
    }
    arr = [...arr.slice(0, best), arr[best] + arr[best + 1], ...arr.slice(best + 2)]
    frames.push({ pythonLine: 9, phase: 'merge', activeLine: L('replace the pair'), at: best, pair: [best, best + 1], arr: [...arr], operations, message: `Merge into one value; array is now [${arr.join(', ')}].` })
    operations += 1
    frames.push({ pythonLine: 10, phase: 'merge', activeLine: L('count one operation'), at: best, pair: null, arr: [...arr], operations, message: `Operations so far: ${operations}.` })
  }
  frames.push({ pythonLine: 11, phase: 'done', activeLine: L('return the number of operations'), at: -1, pair: null, arr: [...arr], operations, message: `The array is sorted after ${operations} operation${operations === 1 ? '' : 's'}.` })
  return { input: [...nums], result: operations, frames }
}

export const code = `find the fewest merges that make the array non-decreasing
  start with a copy of nums and 0 operations
  while some adjacent pair decreases
    start the best pair at the first pair
    for each later pair
      if the sum of this pair is smaller than the best then remember this pair
    replace the pair at the best position with its sum
    count one operation
  return the number of operations`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_pair_removal(nums):
    arr = list(nums)
    operations = 0
    while any(arr[i] > arr[i + 1] for i in range(len(arr) - 1)):
        best = 0
        for i in range(1, len(arr) - 1):
            if arr[i] + arr[i + 1] < arr[best] + arr[best + 1]:
                best = i
        arr[best:best + 2] = [arr[best] + arr[best + 1]]
        operations += 1
    return operations
`
