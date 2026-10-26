export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 50000 || !/^[a-z]+$/.test(s)) throw new Error('Enter a JSON string of 1–50,000 lowercase letters.')
  return s
}

// Two pointers; at the first mismatch, the answer is true if either side of the mismatch is a palindrome.
export function buildTrace(s) {
  const isPal = (l, r) => { while (l < r) { if (s[l] !== s[r]) return false; l++; r-- } return true }
  let l = 0, r = s.length - 1
  const frames = [{ phase: 'start', left: l, right: r, activeLine: 2, message: 'Compare the two ends and move inward.' }]
  while (l < r) {
    if (s[l] === s[r]) {
      l++; r--
      frames.push({ phase: 'match', left: l, right: r, activeLine: 5, message: `${s[l - 1]} = ${s[r + 1]}: move both pointers inward.` })
      continue
    }
    const skipLeft = isPal(l + 1, r), skipRight = isPal(l, r - 1)
    frames.push({ phase: 'mismatch', left: l, right: r, skipLeft, skipRight, activeLine: 7, message: `${s[l]} ≠ ${s[r]}: deleting ${s[l]} ${skipLeft ? 'works' : 'fails'}; deleting ${s[r]} ${skipRight ? 'works' : 'fails'}.` })
    const result = skipLeft || skipRight
    frames.push({ phase: 'done', left: l, right: r, result, activeLine: 9, message: result ? 'Removing one character leaves a palindrome.' : 'Neither deletion helps.' })
    return { input: s, result, frames }
  }
  frames.push({ phase: 'done', left: l, right: r, result: true, activeLine: 10, message: 'Already a palindrome.' })
  return { input: s, result: true, frames }
}

export const code = `def validPalindrome(s):
    def pal(l, r):
        while l < r:
            if s[l] != s[r]: return False
            l, r = l + 1, r - 1
        return True
    l, r = 0, len(s) - 1
    while l < r:
        if s[l] != s[r]: return pal(l + 1, r) or pal(l, r - 1)
        l, r = l + 1, r - 1
    return True`.split('\n').map((text, index) => ({ line: index + 1, text }))
