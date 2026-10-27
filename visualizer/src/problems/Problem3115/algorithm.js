const isPrime = x => {
  if (x < 2) return false
  for (let d = 2; d * d <= x; d++) if (x % d === 0) return false
  return true
}

export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 15) throw new Error('Use an array of 1 to 15 integers.')
  if (arr.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Values are integers from 1 to 100.')
  if (!arr.some(isPrime)) throw new Error('The array must contain at least one prime.')
  return arr
}

export const code = `maximum distance between two prime positions
  let n be the length of nums
  let first and last be unset
  scan from left to right
  if the value is prime and first is unset then set first to the index
  scan from right to left
  if the value is prime and last is unset then set last to the index
  return last minus first`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace(arr) {
  const frames = [{ phase: 'start', activeLine: L('let first and last'), index: -1, first: null, last: null, message: 'Find the first and last prime positions.' }]
  let first = null
  for (let i = 0; i < arr.length && first === null; i++) {
    frames.push({ phase: 'left', activeLine: L('scan from left'), index: i, first, last: null, message: `Check position ${i} (${arr[i]}) from the left.` })
    if (isPrime(arr[i])) first = i
  }
  let last = null
  for (let i = arr.length - 1; i >= 0 && last === null; i--) {
    frames.push({ phase: 'right', activeLine: L('scan from right'), index: i, first, last, message: `Check position ${i} (${arr[i]}) from the right.` })
    if (isPrime(arr[i])) last = i
  }
  const result = last - first
  frames.push({ phase: 'done', activeLine: L('return last minus first'), index: -1, first, last, message: `Primes sit at ${first} and ${last}, so the distance is ${result}.` })
  return { input: arr, result, frames }
}

export const python = `def max_prime_distance(nums):
    def is_prime(x):
        if x < 2:
            return False
        d = 2
        while d * d <= x:
            if x % d == 0:
                return False
            d += 1
        return True

    first = None
    for i, value in enumerate(nums):
        if is_prime(value):
            first = i
            break
    last = None
    for i in range(len(nums) - 1, -1, -1):
        if is_prime(nums[i]):
            last = i
            break
    return last - first
`
