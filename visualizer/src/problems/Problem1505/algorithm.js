export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with num (a digit string) and k.')
  const { num, k } = data
  if (typeof num !== 'string' || !/^[0-9]{1,8}$/.test(num)) throw new Error('num must be a string of 1 to 8 digits.')
  if (!Number.isInteger(k) || k < 0 || k > 20) throw new Error('k is an integer from 0 to 20.')
  return { num, k }
}

export function buildTrace(input) {
  const digits = input.num.split('')
  const n = digits.length
  let left = input.k
  const frames = [{ phase: 'start', activeLine: L('let left = k'), pythonLine: 4, digits: [...digits], index: -1, left, message: `Start with ${input.num} and ${left} swaps.` }]
  for (let i = 0; i < n && left > 0; i++) {
    let best = i
    const reach = Math.min(n - 1, i + left)
    for (let j = i + 1; j <= reach; j++) if (digits[j] < digits[best]) best = j
    const moved = digits.splice(best, 1)[0]
    digits.splice(i, 0, moved)
    const cost = best - i
    left -= cost
    frames.push({ phase: 'move', activeLine: L('digits.splice(i, 0, moved)'), pythonLine: 14, digits: [...digits], index: i, reach, best, left, message: `Bring ${moved} to position ${i} for ${cost} swap${cost === 1 ? '' : 's'}. ${left} left.` })
  }
  const result = digits.join('')
  frames.push({ phase: 'done', activeLine: L('return digits.join'), pythonLine: 16, digits: [...digits], index: -1, left, message: `Smallest reachable number: ${result}.` })
  return { input, result, frames }
}

const CODE = [
  'function smallestAfterSwaps(num, k) {',
  '  const digits = num.split(\'\')',
  '  let left = k',
  '  for (let i = 0; i < digits.length && left > 0; i++) {',
  '    let best = i',
  '    const reach = Math.min(digits.length - 1, i + left)',
  '    for (let j = i + 1; j <= reach; j++) if (digits[j] < digits[best]) best = j',
  '    const [moved] = digits.splice(best, 1)',
  '    digits.splice(i, 0, moved)',
  '    left -= best - i',
  '  }',
  "  return digits.join('')",
  '}',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
const L = s => CODE.findIndex(text => text.includes(s)) + 1

export const python = `def smallest_after_swaps(num, k):
    digits = list(num)
    n = len(digits)
    left = k
    for i in range(n):
        if left == 0:
            break
        best = i
        reach = min(n - 1, i + left)
        for j in range(i + 1, reach + 1):
            if digits[j] < digits[best]:
                best = j
        moved = digits.pop(best)
        digits.insert(i, moved)
        left -= best - i
    return ''.join(digits)
`
