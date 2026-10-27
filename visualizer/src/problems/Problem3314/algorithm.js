const isPrime = n => {
  if (n < 2) return false
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false
  return true
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, such as {"nums":[2,3,5,7]}.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums must hold 1 to 12 primes.')
  if (nums.some(v => !Number.isInteger(v) || v < 2 || v > 1000 || !isPrime(v))) throw new Error('Each number is a prime from 2 to 1000.')
  return { nums }
}

export const code = `minimum x such that x OR (x plus 1) equals each prime
  set answers to an empty list
  for each prime p in nums
    set low to the lowest unset bit of p as a power of two
    set candidate to p XOR (low shifted right by one)
    if candidate OR (candidate plus 1) equals p then append candidate
    otherwise append -1
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ nums }) {
  const answers = []
  const frames = [{ phase: 'start', activeLine: L('set answers to an empty list'), index: -1, answers: [], message: 'Find the smallest x whose lowest zero bit, once set, produces the prime when OR-ed with x + 1.' }]
  nums.forEach((prime, index) => {
    const low = (prime + 1) & ~prime
    const candidate = prime ^ (low >> 1)
    frames.push({ phase: 'pick', activeLine: L('set candidate'), index, prime, candidate, answers: [...answers], message: `Prime ${prime}: lowest unset bit is ${low}, so the candidate is ${candidate}.` })
    const ok = (candidate | (candidate + 1)) === prime
    answers.push(ok ? candidate : -1)
    frames.push({ phase: 'check', activeLine: L('if candidate OR'), index, prime, candidate, answers: [...answers], message: ok ? `${candidate} OR ${candidate + 1} = ${prime}, so ${candidate} is the answer.` : `${candidate} OR ${candidate + 1} is not ${prime}, so the answer is -1.` })
  })
  frames.push({ phase: 'done', activeLine: L('return answers'), index: -1, answers: [...answers], message: `Answers: ${answers.join(', ')}.` })
  return { input: { nums }, result: answers, frames }
}

export const python = `def min_bitwise_array_i(nums):
    answers = []
    for prime in nums:
        low = (prime + 1) & ~prime
        candidate = prime ^ (low >> 1)
        if (candidate | (candidate + 1)) == prime:
            answers.append(candidate)
        else:
            answers.append(-1)
    return answers
`
