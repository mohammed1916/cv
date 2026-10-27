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
  const frames = [{ phase: 'start', activeLine: L('can_odd[-1]'), index: n - 1, odd: null, even: null, canOdd: [...canOdd], canEven: [...canEven], message: 'The last index reaches itself. Work backwards and decide each index from the indices after it.' }]
  for (let i = n - 2; i >= 0; i--) {
    const oddTo = jumpTarget(arr, i, true)
    const evenTo = jumpTarget(arr, i, false)
    canOdd[i] = oddTo !== -1 && canEven[oddTo]
    canEven[i] = evenTo !== -1 && canOdd[evenTo]
    frames.push({ phase: 'fill', activeLine: L('can_even[i]'), index: i, odd: oddTo, even: evenTo, canOdd: [...canOdd], canEven: [...canEven], message: `From ${i}: an odd jump goes to ${oddTo === -1 ? 'nowhere' : oddTo} and ${canOdd[i] ? 'can finish' : 'cannot finish'}; an even jump goes to ${evenTo === -1 ? 'nowhere' : evenTo} and ${canEven[i] ? 'can finish' : 'cannot finish'}.` })
  }
  const result = canOdd.filter(Boolean).length
  frames.push({ phase: 'done', activeLine: L('return sum'), index: null, odd: null, even: null, canOdd: [...canOdd], canEven: [...canEven], message: `${result} starting index(es) reach the end.` })
  return { input: arr, result, frames }
}

export const code = `def oddEvenJumps(arr):
    n = len(arr)
    can_odd = [False] * n
    can_even = [False] * n
    can_odd[-1] = can_even[-1] = True
    for i in range(n - 2, -1, -1):
        odd_to = smallest_at_least(arr, i)
        even_to = largest_at_most(arr, i)
        can_odd[i] = odd_to != -1 and can_even[odd_to]
        can_even[i] = even_to != -1 and can_odd[even_to]
    return sum(can_odd)`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
