export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums)) throw new Error('Use {"nums": [...]} with an array of integers.')
  const { nums } = data
  if (nums.length < 1 || nums.length > 8) throw new Error('nums must have 1 to 8 entries.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 20)) throw new Error('nums entries are integers from 0 to 20.')
  return { nums }
}

const isSquare = s => Number.isInteger(Math.sqrt(s))

export function buildTrace(input) {
  const sorted = [...input.nums].sort((a, b) => a - b)
  const n = sorted.length
  const used = Array(n).fill(false)
  const sequence = []
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('nums.sort()'), index: null, sequence: [], used: [...used], count, result: null, message: `Sort the values to ${sorted.join(', ')}. Equal values are interchangeable, so each repeated value is tried once per position.` }]
  const snapshot = (phase, activeLine, index, message, result = null) => frames.push({ phase, activeLine: L(activeLine), index, sequence: [...sequence], used: [...used], count, result, message })
  const backtrack = () => {
    if (sequence.length === n) {
      count++
      snapshot('complete', 'count += 1', null, `A full arrangement [${sequence.join(', ')}] is squareful. Total so far: ${count}.`)
      return
    }
    for (let i = 0; i < n; i++) {
      if (used[i]) continue
      if (i > 0 && sorted[i] === sorted[i - 1] && !used[i - 1]) {
        snapshot('duplicate', 'if i > 0 and nums[i] == nums[i - 1]', i, `Value ${sorted[i]} at index ${i} repeats an unused value just before it, so this arrangement was already tried.`)
        continue
      }
      const prev = sequence.at(-1)
      if (prev !== undefined && !isSquare(prev + sorted[i])) {
        snapshot('reject', 'if seq and not is_square', i, `${prev} + ${sorted[i]} = ${prev + sorted[i]} is not a perfect square. Skip ${sorted[i]} here.`)
        continue
      }
      used[i] = true
      sequence.push(sorted[i])
      snapshot('place', 'used[i] = True', i, prev === undefined ? `Start the arrangement with ${sorted[i]}.` : `${prev} + ${sorted[i]} = ${prev + sorted[i]} is a perfect square. Place ${sorted[i]}.`)
      backtrack()
      sequence.pop()
      used[i] = false
    }
  }
  backtrack()
  frames.push({ phase: 'done', activeLine: L('return count'), index: null, sequence: [], used: [...used], count, result: count, message: `Distinct squareful arrangements: ${count}.` })
  return { input, result: count, frames }
}

export const code = `from math import isqrt

def is_square(n):
    return isqrt(n) ** 2 == n

def numSquarefulPerms(nums):
    nums.sort()
    n = len(nums)
    used = [False] * n
    seq = []
    count = 0
    def backtrack():
        nonlocal count
        if len(seq) == n:
            count += 1
            return
        for i in range(n):
            if used[i]:
                continue
            if i > 0 and nums[i] == nums[i - 1] and not used[i - 1]:
                continue
            if seq and not is_square(seq[-1] + nums[i]):
                continue
            used[i] = True
            seq.append(nums[i])
            backtrack()
            seq.pop()
            used[i] = False
    backtrack()
    return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
