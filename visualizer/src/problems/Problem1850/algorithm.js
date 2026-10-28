function nextArrangement(a) {
  let i = a.length - 2
  while (i >= 0 && a[i] >= a[i + 1]) i--
  if (i < 0) return false
  let j = a.length - 1
  while (a[j] <= a[i]) j--
  ;[a[i], a[j]] = [a[j], a[i]]
  for (let lo = i + 1, hi = a.length - 1; lo < hi; lo++, hi--) [a[lo], a[hi]] = [a[hi], a[lo]]
  return true
}

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with num (a digit string) and k.')
  const { num, k } = data
  if (typeof num !== 'string' || !/^[0-9]{2,10}$/.test(num)) throw new Error('num must be a string of 2 to 10 digits.')
  if (!Number.isInteger(k) || k < 1 || k > 30) throw new Error('k is an integer from 1 to 30.')
  const probe = num.split('')
  for (let t = 0; t < k; t++) {
    if (!nextArrangement(probe)) throw new Error('num has fewer than k wonderful integers above it.')
  }
  return { num, k }
}

export function buildTrace(input) {
  const current = input.num.split('')
  const frames = [{ phase: 'start', activeLine: L('set current to num'), digits: [...current], index: -1, swaps: 0, message: `Start at ${input.num}. Each step moves to the next arrangement of the same digits.` }]
  for (let t = 0; t < input.k; t++) {
    nextArrangement(current)
    frames.push({ phase: 'advance', activeLine: L('replace current with the next'), digits: [...current], index: -1, swaps: 0, message: `Step ${t + 1}: ${current.join('')} is the next wonderful integer.` })
  }
  const target = [...current]
  const arr = input.num.split('')
  let swaps = 0
  for (let i = 0; i < arr.length; i++) {
    let j = i
    while (arr[j] !== target[i]) j++
    const cost = j - i
    for (let p = j; p > i; p--) [arr[p], arr[p - 1]] = [arr[p - 1], arr[p]]
    swaps += cost
    frames.push({ phase: 'swap', activeLine: L('move that digit to this position'), digits: [...arr], index: i, swaps, message: `Bring ${target[i]} to position ${i} for ${cost} swap${cost === 1 ? '' : 's'}. Total ${swaps}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return swaps'), digits: [...arr], index: -1, swaps, message: `Minimum adjacent swaps: ${swaps}.` })
  return { input, result: swaps, frames }
}

export const code = `minimum adjacent swaps to reach the kth smallest wonderful integer:
  set current to num as a list of digits
  repeat k times
    replace current with the next arrangement of its digits
  set target to current, and swaps to zero
  for each position from the front
    find the nearest digit at or after this position that equals the target digit
    move that digit to this position by adjacent swaps
    add the number of swaps used to swaps
  return swaps`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def kth_wonderful_swaps(num, k):
    def next_arrangement(a):
        i = len(a) - 2
        while i >= 0 and a[i] >= a[i + 1]:
            i -= 1
        if i < 0:
            return False
        j = len(a) - 1
        while a[j] <= a[i]:
            j -= 1
        a[i], a[j] = a[j], a[i]
        a[i + 1:] = reversed(a[i + 1:])
        return True

    current = list(num)
    for _ in range(k):
        next_arrangement(current)
    target = current
    arr = list(num)
    swaps = 0
    for i in range(len(arr)):
        j = i
        while arr[j] != target[i]:
            j += 1
        while j > i:
            arr[j], arr[j - 1] = arr[j - 1], arr[j]
            j -= 1
            swaps += 1
    return swaps
`
