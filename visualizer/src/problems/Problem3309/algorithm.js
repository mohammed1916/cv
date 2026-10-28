export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length !== 3) throw new Error('Use an array of exactly 3 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 127)) throw new Error('Values are integers from 1 to 127.')
  return nums
}

const better = (x, y) => {
  if (x + y > y + x) return -1
  if (x + y < y + x) return 1
  return 0
}

export function buildTrace(nums) {
  const bins = nums.map(v => v.toString(2))
  const frames = [{ phase: 'convert', activeLine: L('write each number'), ordered: [...bins], joined: '', message: `Write each number in binary: ${bins.join(', ')}.` }]
  const ordered = [...bins].sort(better)
  frames.push({ phase: 'order', activeLine: L('sort the binary strings'), ordered: [...ordered], joined: '', message: `Order them so that each pair reads as large as possible: ${ordered.join(' then ')}.` })
  const joined = ordered.join('')
  frames.push({ phase: 'join', activeLine: L('join the sorted'), ordered: [...ordered], joined, message: `Joined binary string: ${joined}.` })
  const result = parseInt(joined, 2)
  frames.push({ phase: 'done', activeLine: L('return the value'), ordered: [...ordered], joined, message: `Maximum value: ${result}.` })
  return { input: nums, result, frames }
}

export const code = `maximum possible number from binary concatenation:
  write each number in binary
  sort the binary strings so that a comes before b when a plus b is larger than b plus a
  join the sorted strings in order
  return the value of the joined binary string`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from functools import cmp_to_key

def maximum_binary_number(nums):
    bins = [bin(v)[2:] for v in nums]
    def compare(x, y):
        if x + y > y + x:
            return -1
        if x + y < y + x:
            return 1
        return 0
    joined = ''.join(sorted(bins, key=cmp_to_key(compare)))
    return int(joined, 2)
`
