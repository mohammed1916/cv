export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || typeof data.text !== 'string') throw new Error('Use an object with a string text, for example {"text":"ghiabcdefhelloadamhelloabcdefghi"}.')
  if (data.text.length < 1 || data.text.length > 40) throw new Error('text must have 1 to 40 characters.')
  if (!/^[a-z]+$/.test(data.text)) throw new Error('text may contain only lowercase English letters.')
  return { text: data.text }
}

export function buildTrace({ text }) {
  const frames = []
  let count = 0
  let left = 0
  let right = text.length
  frames.push({ phase: 'start', activeLine: L('set count to 0'), left, right, count, result: null, message: `Start with all of ${text}. Each step peels off the shortest equal prefix and suffix.` })
  while (left < right) {
    let size = 0
    for (let candidate = 1; candidate <= Math.floor((right - left) / 2); candidate++) {
      if (text.slice(left, left + candidate) === text.slice(right - candidate, right)) { size = candidate; break }
    }
    if (size === 0) {
      count += 1
      frames.push({ phase: 'middle', activeLine: L('add 1 to count'), left, right, count, result: null, message: `No prefix matches a suffix in ${text.slice(left, right)}, so it stays as one chunk.` })
      break
    }
    count += 2
    frames.push({ phase: 'pair', activeLine: L('add 2 to count'), left, right, count, result: null, message: `Prefix ${text.slice(left, left + size)} matches the suffix. Two chunks added; count is ${count}.` })
    left += size
    right -= size
  }
  frames.push({ phase: 'done', activeLine: L('return count'), left, right, count, result: count, message: `The longest decomposition has ${count} chunks.` })
  return { input: { text }, result: count, frames }
}

export const code = `longest chunked palindrome decomposition (text)
  set count to 0, left to 0, and right to the length of text
  while left is less than right
    look for the shortest size where the prefix of that size equals the suffix of that size, inside the unmatched part
    if such a size exists then
      add 2 to count
      move left forward by size and right back by size
    otherwise
      add 1 to count
      stop the loop
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
export const python = `def longest_decomposition(text):
    count = 0
    left = 0
    right = len(text)
    while left < right:
        size = 0
        for candidate in range(1, (right - left) // 2 + 1):
            if text[left:left + candidate] == text[right - candidate:right]:
                size = candidate
                break
        if size == 0:
            count += 1
            break
        count += 2
        left += size
        right -= size
    return count
`
