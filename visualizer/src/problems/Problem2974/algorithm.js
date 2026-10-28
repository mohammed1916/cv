export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || !Array.isArray(obj.nums)) throw new Error('Use an object with an array key nums.')
  const { nums } = obj
  if (nums.length < 2 || nums.length > 20 || nums.length % 2 !== 0) throw new Error('nums has an even number of entries from 2 to 20.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('nums entries are integers from 1 to 100.')
  return { nums }
}

export function buildTrace(input) {
  const { nums } = input
  const sorted = [...nums].sort((a, b) => a - b)
  const arr = []
  const frames = [{ phase: 'start', activeLine: L('set sorted to'), index: -1, arr: [], message: 'Sort the values. Each round removes the two smallest that remain.' }]
  for (let i = 0; i < sorted.length; i += 2) {
    const alice = sorted[i]
    const bob = sorted[i + 1]
    arr.push(bob, alice)
    frames.push({ phase: 'round', activeLine: L('add b to arr'), index: i, arr: [...arr], message: `Alice removes ${alice}, Bob removes ${bob}. Bob appends ${bob}, then Alice appends ${alice}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return arr'), index: -1, arr: [...arr], message: `Final array: ${arr.join(', ')}.` })
  return { input, sorted, result: arr, frames }
}

export const code = `minimum number game
  set sorted to nums in ascending order
  set arr to an empty list
  for each pair of values (a, b) taken two at a time from sorted
    Alice removes a
    Bob removes b
    add b to arr
    add a to arr
  return arr`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def number_game(nums):
    ordered = sorted(nums)
    arr = []
    for i in range(0, len(ordered), 2):
        a = ordered[i]
        b = ordered[i + 1]
        arr.append(b)
        arr.append(a)
    return arr
`
