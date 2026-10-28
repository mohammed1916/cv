const LIMIT = 1000000000000000

export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isSafeInteger(n) || n < 0 || n > LIMIT) throw new Error('Use an integer from 0 to 1000000000000000.')
  return n
}

// Palindrome of the given length whose first half is `half` (the first half keeps the leading bit).
const mirror = (half, length) => {
  const s = half.toString(2)
  const h = s.length
  return BigInt('0b' + s + s.slice(0, length - h).split('').reverse().join(''))
}

export function buildTrace(n) {
  const limit = BigInt(n)
  const frames = []
  let total = 1n
  frames.push({ phase: 'start', activeLine: L('set total to 1'), length: 0, count: 1, total: 1, message: 'Count 0 first; it is written "0" and is a palindrome.' })
  const bits = n === 0 ? 0 : n.toString(2).length
  for (let length = 1; length <= bits; length++) {
    const h = Math.ceil(length / 2)
    const low = 1n << BigInt(h - 1)
    const high = (1n << BigInt(h)) - 1n
    let count = 0n
    if (mirror(low, length) <= limit) {
      let lo = low
      let hi = high
      while (lo < hi) {
        const mid = (lo + hi + 1n) / 2n
        if (mirror(mid, length) <= limit) lo = mid
        else hi = mid - 1n
      }
      count = lo - low + 1n
    }
    total += count
    frames.push({ phase: 'length', activeLine: L('for each bit length'), length, count: Number(count), total: Number(total), message: `Length ${length}: ${count} palindromes not above ${n}. Total ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), length: bits, count: 0, total: Number(total), message: `Answer: ${total}.` })
  return { input: n, result: Number(total), frames }
}

export const code = `count binary palindromes up to n (n):
  set total to 1 for the number 0
  for each bit length L from 1 to the bit length of n do
    the first half of a palindrome has h = ceil(L / 2) bits
    find the largest first half whose palindrome is at most n
      by binary search over the first halves with leading bit 1
    add the number of valid first halves to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_binary_palindromes(n):
    total = 1
    for length in range(1, n.bit_length() + 1):
        half_len = (length + 1) // 2
        low = 1 << (half_len - 1)
        high = (1 << half_len) - 1

        def pal(half):
            s = bin(half)[2:]
            return int(s + s[:length - half_len][::-1], 2)

        if pal(low) > n:
            continue
        lo, hi = low, high
        while lo < hi:
            mid = (lo + hi + 1) // 2
            if pal(mid) <= n:
                lo = mid
            else:
                hi = mid - 1
        total += lo - low + 1
    return total
`
