export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums holds 1 to 12 integers.')
  if (!nums.every(x => Number.isInteger(x) && x >= 1 && x <= 9)) throw new Error('Each number is an integer from 1 to 9.')
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k is a window length from 1 to the length of nums.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  const answers = []
  const frame = fields => frames.push({ answers: [...answers], ...fields })
  frame({ pythonLine: P('answers = []'), phase: 'start', activeLine: L('for each window start'), start: -1, window: [], target: [], left: -1, right: -1, message: `Slide a window of length ${k} across the list.` })
  for (let start = 0; start + k <= nums.length; start++) {
    const window = nums.slice(start, start + k)
    const target = [...window].sort((x, y) => x - y)
    frame({ pythonLine: P('target = sorted(window)'), phase: 'window', activeLine: L('copy the window and sort'), start, window, target, left: -1, right: -1, message: `Window ${start} holds [${window.join(', ')}]; its sorted copy is [${target.join(', ')}].` })
    let left = 0
    while (left < k && window[left] === target[left]) left++
    if (left === k) {
      answers.push(0)
      frame({ pythonLine: P('answers.append(0)'), phase: 'record', activeLine: L('the answer is 0'), start, window, target, left: -1, right: -1, message: `Window ${start} is already sorted, so its answer is 0.` })
      continue
    }
    frame({ pythonLine: P('left += 1'), phase: 'left', activeLine: L('find the first position'), start, window, target, left, right: -1, message: `The first mismatch is at offset ${left}.` })
    let right = k - 1
    while (window[right] === target[right]) right--
    frame({ pythonLine: P('right -= 1'), phase: 'right', activeLine: L('find the last position'), start, window, target, left, right, message: `The last mismatch is at offset ${right}.` })
    answers.push(right - left + 1)
    frame({ pythonLine: P('answers.append(right - left + 1)'), phase: 'record', activeLine: L('record right minus left plus one'), start, window, target, left, right, message: `Sorting offsets ${left} to ${right} fixes window ${start}; the answer is ${right - left + 1}.` })
  }
  frame({ pythonLine: P('return answers'), phase: 'done', activeLine: L('return the answers'), start: -1, window: [], target: [], left: -1, right: -1, message: 'Every window has its shortest segment length.' })
  return { input: { nums, k }, result: [...answers], frames }
}

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const code = `shortest unsorted segment in every window of length k
  set the answers list to empty
  for each window start from 0 to n minus k
    copy the window and sort the copy
    if the window equals its sorted copy at every offset then the answer is 0
    otherwise find the first position where they differ, called left
    find the last position where they differ, called right
    record right minus left plus one
  return the answers`.split('\n').map((text, index) => ({ line: index + 1, text: text.trimEnd() }))

export const python = `def shortest_sort_windows(nums, k):
    answers = []
    for start in range(len(nums) - k + 1):
        window = nums[start:start + k]
        target = sorted(window)
        left = 0
        while left < k and window[left] == target[left]:
            left += 1
        if left == k:
            answers.append(0)
            continue
        right = k - 1
        while window[right] == target[right]:
            right -= 1
        answers.append(right - left + 1)
    return answers
`
