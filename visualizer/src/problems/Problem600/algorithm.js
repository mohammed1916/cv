export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 0 || n > 1000000000) throw new Error('Enter an integer n from 0 to 1,000,000,000.')
  return n
}

export function buildTrace(n) {
  const bits = n.toString(2)
  const L = bits.length
  // fib[k] = number of binary strings of length k with no two adjacent 1s.
  const fib = [1, 2]
  for (let k = 2; k <= L; k++) fib[k] = fib[k - 1] + fib[k - 2]
  const frames = [{ phase: 'start', bit: null, index: -1, count: 0, bits, activeLine: 2, message: `Write ${n} as ${bits} in binary; count valid numbers ≤ ${n}.` }]
  let count = 0
  let prevOne = false
  let stopped = false
  for (let i = 0; i < L; i++) {
    const bit = bits[i] === '1'
    const remaining = L - i - 1
    if (bit) {
      count += fib[remaining]
      frames.push({ phase: 'choose0', bit: 1, index: i, count, bits, activeLine: 5, message: `Put 0 here, leaving ${remaining} free bits: +${fib[remaining]} numbers.` })
      if (prevOne) {
        frames.push({ phase: 'stop', bit: 1, index: i, count, bits, activeLine: 7, message: `The prefix already ends in 1, so a 1 here would be adjacent. Stop before n itself.` })
        stopped = true
        break
      }
    } else {
      frames.push({ phase: 'follow', bit: 0, index: i, count, bits, activeLine: 4, message: 'Bit is 0: follow the same prefix.' })
    }
    prevOne = bit
  }
  if (!stopped) { count += 1; frames.push({ phase: 'self', bit: null, index: L - 1, count, bits, activeLine: 8, message: `${n} itself has no adjacent 1s: +1.` }) }
  frames.push({ phase: 'done', bit: null, index: L - 1, count, bits, result: count, activeLine: 9, message: `Valid numbers in [0, ${n}]: ${count}.` })
  return { input: n, result: count, bits, frames }
}

export const code = `write n in binary and build the counts of valid suffixes for each length
start the answer at zero and the previous bit at zero
for each bit of n from the most significant bit
  if the bit is one
    add the count of valid suffixes for the remaining positions
    if the previous bit was also one, return the answer
  remember this bit as the previous bit
return the answer plus one, which counts n itself`.split('\n').map((text, index) => ({ line: index + 1, text }))

// The family visualizer reports code stages rather than line numbers. This maps each frame onto the lines above.
export function familyLine(frame) {
  if (frame.phase === 'start') return 1
  if (frame.phase === 'done') return frame.codeStage === 'stop' ? 6 : 8
  return { branch: 5, stop: 6 }[frame.codeStage] ?? 5
}

export const python = `def find_integers(n):
    bits = bin(n)[2:]
    counts = [1, 2]
    for i in range(2, len(bits) + 1):
        counts.append(counts[-1] + counts[-2])
    answer, previous = 0, 0
    for index, ch in enumerate(bits):
        bit = int(ch)
        remaining = len(bits) - index - 1
        if bit:
            answer += counts[remaining]
            if previous:
                return answer
        previous = bit
    return answer + 1`
