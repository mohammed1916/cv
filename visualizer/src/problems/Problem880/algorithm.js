const isDigit = c => c >= '2' && c <= '9'

export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length !== 2 || typeof arr[0] !== 'string' || !Number.isInteger(arr[1])) throw new Error('Enter a JSON array ["encoded string", k].')
  const [s, k] = arr
  if (s.length < 2 || s.length > 100 || !/^[a-z2-9]+$/.test(s) || !/^[a-z]/.test(s) || !/[a-z]$|[2-9]$/.test(s)) {
    throw new Error('s must have 2–100 characters (lowercase letters and digits 2–9) and start with a letter.')
  }
  if (k < 1 || k > 1000000000) throw new Error('k must be between 1 and 1,000,000,000.')
  let len = 0n
  for (const c of s) len = isDigit(c) ? len * BigInt(c) : len + 1n
  if (BigInt(k) > len) throw new Error(`k is larger than the decoded length (${len}).`)
  return { s, k }
}

export function buildTrace({ s, k: k0 }) {
  let k = k0
  let size = 0
  let end = 0
  const frames = [{ phase: 'start', index: -1, size, k, activeLine: 2, message: `Find the ${k}-th character of the decoded string without expanding it. Track only its length.` }]
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (isDigit(c)) size *= Number(c)
    else size += 1
    end = i
    frames.push({
      phase: 'length', index: i, size, k, activeLine: isDigit(c) ? 6 : 8,
      message: isDigit(c) ? `'${c}' repeats everything so far ${c} times: size = ${size}.` : `Letter '${c}' adds one character: size = ${size}.`,
    })
    if (size >= k) {
      frames.push({ phase: 'length', index: i, size, k, activeLine: 10, message: `size ${size} ≥ k ${k}: the answer is inside the prefix s[0..${i}], so stop growing.` })
      break
    }
  }
  let result = null
  for (let i = end; i >= 0; i--) {
    const c = s[i]
    k %= size
    if (k === 0 && !isDigit(c)) {
      result = c
      frames.push({ phase: 'unwind', index: i, size, k, activeLine: 15, message: `k mod size = 0 and '${c}' is a letter: the k-th character is the last one of this prefix, '${c}'.` })
      break
    }
    if (isDigit(c)) {
      size = size / Number(c)
      frames.push({ phase: 'unwind', index: i, size, k, activeLine: 18, message: `Undo '${c}': the decoded text is ${c} copies of a block, so k wraps to ${k} within a block of size ${size}.` })
    } else {
      size -= 1
      frames.push({ phase: 'unwind', index: i, size, k, activeLine: 20, message: `Undo letter '${c}': it was not the target, so size = ${size} (k = ${k}).` })
    }
  }
  frames.push({ phase: 'done', index: end, size, k, activeLine: 16, message: `The character at position ${k0} is '${result}'.` })
  return { input: { s, k: k0 }, result, frames }
}

export const code = `def decodeAtIndex(s, k):
    size = 0
    end = 0
    for i, c in enumerate(s):
        if c.isdigit():
            size *= int(c)
        else:
            size += 1
        end = i
        if size >= k:
            break
    for i in range(end, -1, -1):
        c = s[i]
        k %= size
        if k == 0 and c.isalpha():
            return c
        if c.isdigit():
            size //= int(c)
        else:
            size -= 1`.split('\n').map((text, index) => ({ line: index + 1, text }))
