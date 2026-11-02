export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 50 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 50) || new Set(nums).size !== nums.length) throw new Error('Use a JSON array of 3 to 50 distinct integers from 1 to 50.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  const arr1 = [nums[0]]
  const arr2 = [nums[1]]
  frames.push({ pythonLine: 3, phase: 'start', activeLine: L('arr1 = [first value]; arr2 = [second value]'), arr1: [...arr1], arr2: [...arr2], value: null, message: `arr1 starts with ${nums[0]}, arr2 with ${nums[1]}.` })
  for (let i = 2; i < nums.length; i++) {
    const x = nums[i]
    if (arr1[arr1.length - 1] > arr2[arr2.length - 1]) {
      arr1.push(x)
      frames.push({ pythonLine: 6, phase: 'arr1', activeLine: L('if the last of arr1 is greater than the last of arr2, append x to arr1'), arr1: [...arr1], arr2: [...arr2], value: x, message: `${arr1[arr1.length - 2]} is greater than ${arr2[arr2.length - 1]}, so ${x} goes to arr1.` })
    } else {
      arr2.push(x)
      frames.push({ pythonLine: 8, phase: 'arr2', activeLine: L('otherwise append x to arr2'), arr1: [...arr1], arr2: [...arr2], value: x, message: `${arr1[arr1.length - 1]} is not greater than ${arr2[arr2.length - 2]}, so ${x} goes to arr2.` })
    }
  }
  const result = [...arr1, ...arr2]
  frames.push({ pythonLine: 9, phase: 'done', activeLine: L('return arr1 followed by arr2'), arr1: [...arr1], arr2: [...arr2], value: null, message: `Concatenate to get [${result.join(', ')}].` })
  return { input: nums, result, frames }
}

export const code = `distribute the values into two arrays
  arr1 = [first value]; arr2 = [second value]
  for each remaining value x in order
    if the last of arr1 is greater than the last of arr2, append x to arr1
    otherwise append x to arr2
  return arr1 followed by arr2`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def distribute(nums):
    arr1 = [nums[0]]
    arr2 = [nums[1]]
    for x in nums[2:]:
        if arr1[-1] > arr2[-1]:
            arr1.append(x)
        else:
            arr2.append(x)
    return arr1 + arr2
`
