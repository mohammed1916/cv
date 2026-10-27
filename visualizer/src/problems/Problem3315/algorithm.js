const isPrime = n => {
  if (n < 2) return false
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false
  return true
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, such as {"nums":[11,13,31]}.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums must hold 1 to 12 primes.')
  if (nums.some(v => !Number.isInteger(v) || v < 2 || v > 1000 || !isPrime(v))) throw new Error('Each number is a prime from 2 to 1000.')
  return { nums }
}

export const code = `minimum x such that x OR (x plus 1) equals each prime
  set answers to an empty list
  for each prime p in nums
    find bit, the index of the lowest zero bit of p
    if bit is zero then append -1
    otherwise set candidate to p with bit minus 1 cleared, then append candidate
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ nums }) {
  const answers = []
  const frames = [{ phase: 'start', activeLine: L('set answers to an empty list'), index: -1, answers: [], message: 'Look for the lowest zero bit of each prime; that bit decides the answer.' }]
  nums.forEach((prime, index) => {
    let bit = 0
    while ((prime >> bit) & 1) bit++
    frames.push({ phase: 'bit', activeLine: L('find bit, the index'), index, prime, bit, answers: [...answers], message: `Prime ${prime} has its lowest zero bit at index ${bit}.` })
    if (bit === 0) {
      answers.push(-1)
      frames.push({ phase: 'candidate', activeLine: L('if bit is zero'), index, prime, bit, answers: [...answers], message: `Bit 0 of ${prime} is zero, so no x works. Answer -1.` })
    } else {
      const candidate = prime ^ (1 << (bit - 1))
      answers.push(candidate)
      frames.push({ phase: 'candidate', activeLine: L('set candidate to p'), index, prime, bit, candidate, answers: [...answers], message: `Clear bit ${bit - 1} of ${prime} to get ${candidate}.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return answers'), index: -1, answers: [...answers], message: `Answers: ${answers.join(', ')}.` })
  return { input: { nums }, result: answers, frames }
}

export const python = `def min_bitwise_array_ii(nums):
    answers = []
    for prime in nums:
        bit = 0
        while (prime >> bit) & 1:
            bit += 1
        if bit == 0:
            answers.append(-1)
        else:
            answers.append(prime ^ (1 << (bit - 1)))
    return answers
`
