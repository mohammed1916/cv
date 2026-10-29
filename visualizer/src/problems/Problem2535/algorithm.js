const PYTHON_SOURCE = `def difference_of_sum(nums):
    element_sum = 0
    digit_sum = 0
    for num in nums:
        element_sum += num
        rest = num
        while rest > 0:
            digit_sum += rest % 10
            rest //= 10
    return abs(element_sum - digit_sum)`

const PY = PYTHON_SOURCE.split('\n')
const py = (text) => {
  const index = PY.findIndex((line) => line.trim() === text)
  if (index < 0) throw new Error(`Python line not found: ${text}`)
  return index + 1
}

export const python = PYTHON_SOURCE

export const code = [
  { line: 1, text: 'function differenceOfSum(nums)' },
  { line: 2, text: 'elementSum = 0 and digitSum = 0' },
  { line: 3, text: 'for each num in nums' },
  { line: 4, text: 'elementSum = elementSum + num' },
  { line: 5, text: 'rest = num' },
  { line: 6, text: 'while rest is greater than 0' },
  { line: 7, text: 'digitSum = digitSum + (rest mod 10)' },
  { line: 8, text: 'rest = rest integer-divided by 10' },
  { line: 9, text: 'return absolute value of (elementSum minus digitSum)' },
]

export function parseInput(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Input must be valid JSON, for example {"nums": [1, 15, 6, 3]}')
  }
  if (!data || typeof data !== 'object' || Array.isArray(data) || !Array.isArray(data.nums)) {
    throw new Error('Input must be an object with a nums array')
  }
  if (data.nums.length < 1 || data.nums.length > 2000) throw new Error('nums length must be between 1 and 2000')
  for (const value of data.nums) {
    if (!Number.isInteger(value) || value < 1 || value > 2000) throw new Error('Each nums value must be an integer from 1 to 2000')
  }
  return { nums: [...data.nums] }
}

export function buildTrace(input) {
  const { nums } = input
  const frames = []
  let elementSum = 0
  let digitSum = 0
  let index = -1
  let rest = null
  let digit = null
  const add = (fields) => frames.push({ nums, index, elementSum, digitSum, rest, digit, result: null, ...fields })

  add({ phase: 'init', activeLine: 2, pythonLine: py('element_sum = 0'), message: 'Start the element sum at 0.' })
  add({ phase: 'init', activeLine: 2, pythonLine: py('digit_sum = 0'), message: 'Start the digit sum at 0.' })

  for (let i = 0; i < nums.length; i++) {
    index = i
    const num = nums[i]
    add({ phase: 'scan', activeLine: 3, pythonLine: py('for num in nums:'), message: `Take nums[${i}] = ${num}.` })
    elementSum += num
    add({ phase: 'update', activeLine: 4, pythonLine: py('element_sum += num'), message: `Element sum grows by ${num} to ${elementSum}.` })
    rest = num
    add({ phase: 'scan', activeLine: 5, pythonLine: py('rest = num'), message: `Break ${num} into digits, starting from the right.` })
    while (rest > 0) {
      add({ phase: 'scan', activeLine: 6, pythonLine: py('while rest > 0:'), message: `${rest} is positive, so read its last digit.` })
      digit = rest % 10
      digitSum += digit
      add({ phase: 'update', activeLine: 7, pythonLine: py('digit_sum += rest % 10'), message: `Add digit ${digit}: digit sum is now ${digitSum}.` })
      rest = Math.floor(rest / 10)
      add({ phase: 'update', activeLine: 8, pythonLine: py('rest //= 10'), message: `Drop that digit: rest becomes ${rest}.` })
    }
  }

  index = -1
  const answer = Math.abs(elementSum - digitSum)
  add({ phase: 'done', activeLine: 9, pythonLine: py('return abs(element_sum - digit_sum)'), message: `|${elementSum} - ${digitSum}| = ${answer}.`, result: answer })
  return { input, result: answer, frames }
}
