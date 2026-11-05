export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 1000 || !/^[a-z]+$/.test(s)) throw new Error('Enter a JSON string of 1–1,000 lowercase letters.')
  return s
}

// Two pointers close in from both ends. The first mismatch is the only place a deletion can help, so test both
// options there: drop the left letter, or drop the right letter.
export function buildTrace(s) {
  let l = 0
  let r = s.length - 1
  const frames = [{ phase: 'start', l, r, skipped: null, activeLine: L('let l = 0'), pythonLine: P('l, r = 0, len(s) - 1'), message: 'Compare the two ends and move inward.' }]
  let result = true
  while (l < r) {
    if (s[l] !== s[r]) {
      const dropLeft = isPal(s, l + 1, r)
      const dropRight = isPal(s, l, r - 1)
      result = dropLeft || dropRight
      frames.push({ phase: 'mismatch', l, r, skipped: null, activeLine: L('if (s[l] !== s[r])'), pythonLine: P('if s[l] != s[r]'), message: `${s[l]} ≠ ${s[r]}: try dropping one. Without ${s[l]}: ${dropLeft ? 'palindrome' : 'not'}. Without ${s[r]}: ${dropRight ? 'palindrome' : 'not'}.` })
      frames.push({ phase: 'done', l, r, skipped: dropLeft ? 'left' : dropRight ? 'right' : null, activeLine: L(result ? 'return true' : 'return false'), pythonLine: P(result ? 'return True' : 'return False'), result, message: result ? 'One deletion makes it a palindrome.' : 'Neither deletion works.' })
      return { input: s, result, frames }
    }
    l++
    r--
    frames.push({ phase: 'match', l, r, skipped: null, activeLine: L('l++'), pythonLine: P('l += 1'), message: `Ends match: move inward to ${l} and ${r}.` })
  }
  frames.push({ phase: 'done', l, r, skipped: null, activeLine: L('return true'), pythonLine: P('return True'), result: true, message: 'Every pair matched, so it is already a palindrome.' })
  return { input: s, result, frames }
}

function isPal(s, l, r) {
  while (l < r) {
    if (s[l] !== s[r]) return false
    l++
    r--
  }
  return true
}

const SOURCE = `function validPalindrome(s) {
  let l = 0
  let r = s.length - 1
  while (l < r) {
    if (s[l] !== s[r]) return isPalindrome(s, l + 1, r) || isPalindrome(s, l, r - 1)
    l++
    r--
  }
  return true
}

function isPalindrome(s, l, r) {
  while (l < r) {
    if (s[l] !== s[r]) return false
    l++
    r--
  }
  return true
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def valid_palindrome(s):
    def is_palindrome(l, r):
        while l < r:
            if s[l] != s[r]:
                return False
            l += 1
            r -= 1
        return True

    l, r = 0, len(s) - 1
    while l < r:
        if s[l] != s[r]:
            return is_palindrome(l + 1, r) or is_palindrome(l, r - 1)
        l += 1
        r -= 1
    return True`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
