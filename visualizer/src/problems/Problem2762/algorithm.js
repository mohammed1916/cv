export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Enter 1 to 12 integers from 1 to 10.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 10)) throw new Error('Each value is an integer from 1 to 10.')
  return nums
}

export function buildTrace(nums) {
  const maxQ = [], minQ = []
  let left = 0, total = 0
  const frames = [{ phase: 'start', right: null, left: 0, maxQ: [], minQ: [], total: 0, activeLine: L('set total to 0'), message: 'A window is continuous when its largest and smallest values differ by at most 2.' }]
  nums.forEach((v, right) => {
    while (maxQ.length && nums[maxQ[maxQ.length - 1]] <= v) maxQ.pop()
    maxQ.push(right)
    while (minQ.length && nums[minQ[minQ.length - 1]] >= v) minQ.pop()
    minQ.push(right)
    let shrink = false
    while (nums[maxQ[0]] - nums[minQ[0]] > 2) {
      shrink = true
      left++
      if (maxQ[0] < left) maxQ.shift()
      if (minQ[0] < left) minQ.shift()
    }
    total += right - left + 1
    frames.push({ phase: 'extend', right, left, maxQ: maxQ.slice(), minQ: minQ.slice(), total, shrink, activeLine: L('add right minus left plus 1'), message: `Window [${left}, ${right}] is continuous; it adds ${right - left + 1} subarrays ending here (total ${total}).` })
  })
  frames.push({ phase: 'done', right: null, left, maxQ: maxQ.slice(), minQ: minQ.slice(), total, activeLine: L('return total'), message: `Continuous subarrays: ${total}.` })
  return { input: nums, result: total, frames }
}

export const code = `count continuous subarrays, where the largest and smallest values differ by at most 2
  set total to 0 and left to 0
  for each index right with value v
    pop from the back of maxQueue while its value is at most v, then add right
    pop from the back of minQueue while its value is at least v, then add right
    while the front of maxQueue minus the front of minQueue is more than 2
      move left forward by one and drop expired fronts of both queues
    add right minus left plus 1 to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque

def count_continuous_subarrays(nums):
    max_q, min_q = deque(), deque()
    left = 0
    total = 0
    for right, v in enumerate(nums):
        while max_q and nums[max_q[-1]] <= v:
            max_q.pop()
        max_q.append(right)
        while min_q and nums[min_q[-1]] >= v:
            min_q.pop()
        min_q.append(right)
        while nums[max_q[0]] - nums[min_q[0]] > 2:
            left += 1
            if max_q[0] < left:
                max_q.popleft()
            if min_q[0] < left:
                min_q.popleft()
        total += right - left + 1
    return total
`
