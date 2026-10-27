export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 20) throw new Error('Use 1 to 20 integers.')
  if (arr.some(v => !Number.isInteger(v) || Math.abs(v) > 1000)) throw new Error('Values are integers from -1000 to 1000.')
  return arr
}

// The index an odd jump (smallest value >= arr[i]) or an even jump (largest value <= arr[i]) lands on.
// Ties in value go to the smaller index, which the strict comparison keeps because j increases.
export function jumpTarget(arr, i, odd) {
  let best = -1
  for (let j = i + 1; j < arr.length; j++) {
    const ok = odd ? arr[j] >= arr[i] : arr[j] <= arr[i]
    if (!ok) continue
    if (best === -1 || (odd ? arr[j] < arr[best] : arr[j] > arr[best])) best = j
  }
  return best
}

export function buildTrace(arr) {
  const n = arr.length
  // canOdd[i]: starting at i, the next jump is odd and the end is reachable. canEven likewise for an even jump.
  const canOdd = Array(n).fill(false), canEven = Array(n).fill(false)
  canOdd[n - 1] = canEven[n - 1] = true
  const frames = [{ phase: 'start', activeLine: L('set canOdd[last]'), index: n - 1, odd: null, even: null, canOdd: [...canOdd], canEven: [...canEven], message: 'The last index reaches itself. Work backwards and decide each index from the indices after it.' }]
  for (let i = n - 2; i >= 0; i--) {
    const oddTo = jumpTarget(arr, i, true)
    const evenTo = jumpTarget(arr, i, false)
    canOdd[i] = oddTo !== -1 && canEven[oddTo]
    canEven[i] = evenTo !== -1 && canOdd[evenTo]
    frames.push({ phase: 'fill', activeLine: L('set canEven[i] to'), index: i, odd: oddTo, even: evenTo, canOdd: [...canOdd], canEven: [...canEven], message: `From ${i}: an odd jump goes to ${oddTo === -1 ? 'nowhere' : oddTo} and ${canOdd[i] ? 'can finish' : 'cannot finish'}; an even jump goes to ${evenTo === -1 ? 'nowhere' : evenTo} and ${canEven[i] ? 'can finish' : 'cannot finish'}.` })
  }
  const result = canOdd.filter(Boolean).length
  frames.push({ phase: 'done', activeLine: L('return the number of true'), index: null, odd: null, even: null, canOdd: [...canOdd], canEven: [...canEven], message: `${result} starting index(es) reach the end.` })
  return { input: arr, result, frames }
}

export const code = `oddEvenJumps(arr) returns how many starting indices can reach the last index
  set n to the length of arr
  set canOdd and canEven to lists of n false values
  set canOdd[last] and canEven[last] to true
  for i from n minus 2 down to 0
    set oddTo to the index of the smallest value at least arr[i] after i
    set evenTo to the index of the largest value at most arr[i] after i
    set canOdd[i] to oddTo exists and canEven[oddTo]
    set canEven[i] to evenTo exists and canOdd[evenTo]
  return the number of true values in canOdd`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_at_least(arr, i):
    best = -1
    for j in range(i + 1, len(arr)):
        if arr[j] >= arr[i] and (best == -1 or arr[j] < arr[best]):
            best = j
    return best

def largest_at_most(arr, i):
    best = -1
    for j in range(i + 1, len(arr)):
        if arr[j] <= arr[i] and (best == -1 or arr[j] > arr[best]):
            best = j
    return best

def odd_even_jumps(arr):
    n = len(arr)
    can_odd = [False] * n
    can_even = [False] * n
    can_odd[-1] = can_even[-1] = True
    for i in range(n - 2, -1, -1):
        odd_to = smallest_at_least(arr, i)
        even_to = largest_at_most(arr, i)
        can_odd[i] = odd_to != -1 and can_even[odd_to]
        can_even[i] = even_to != -1 and can_odd[even_to]
    return sum(can_odd)`
