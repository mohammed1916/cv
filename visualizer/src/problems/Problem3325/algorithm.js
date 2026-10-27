export function parseInput(text) {
  const input = JSON.parse(text)
  if (typeof input?.s !== 'string' || input.s.length < 1 || input.s.length > 12 || !/^[a-z]+$/.test(input.s)) throw new Error('Give s as 1 to 12 lowercase letters.')
  if (!Number.isInteger(input.k) || input.k < 1 || input.k > 5) throw new Error('k is an integer from 1 to 5.')
  return { s: input.s, k: input.k }
}

export function buildTrace({ s, k }) {
  const n = s.length
  const frames = [{ phase: 'start', activeLine: L('set total to zero'), start: 0, end: -1, letter: '', count: 0, total: 0, message: `Count substrings where some letter appears at least ${k} times.` }]
  let total = 0
  for (let start = 0; start < n; start++) {
    const counts = new Map()
    for (let end = start; end < n; end++) {
      const letter = s[end]
      counts.set(letter, (counts.get(letter) ?? 0) + 1)
      const count = counts.get(letter)
      frames.push({ phase: 'extend', activeLine: L('add one to the count'), start, end, letter, count, total, message: `Add ${letter}. Its count in ${start} to ${end} is ${count}.` })
      if (count >= k) {
        total += n - end
        frames.push({ phase: 'count', activeLine: L('stop this start'), start, end, letter, count, total, message: `${letter} reaches ${k}, so the ${n - end} substrings from ${start} ending at ${end} or later count. Total ${total}.` })
        break
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return total'), start: 0, end: n - 1, letter: '', count: 0, total, message: `There are ${total} qualifying substrings.` })
  return { input: { s, k }, result: total, frames }
}

export const code = `count substrings with a letter appearing at least k times (s, k)
  set total to zero
  for each start index i
    set counts to an empty map
    for each end index j from i
      add one to the count of the letter at j
      if that count reaches k then add n minus j to total and stop this start
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_k_frequency_substrings(s, k):
    n = len(s)
    total = 0
    for start in range(n):
        counts = {}
        for end in range(start, n):
            counts[s[end]] = counts.get(s[end], 0) + 1
            if counts[s[end]] >= k:
                total += n - end
                break
    return total
`
