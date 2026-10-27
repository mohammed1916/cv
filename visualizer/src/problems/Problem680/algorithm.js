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

export const code = `set left to the first index and right to the last index
while left is less than right and the characters at left and right are equal
  move left one step inward and right one step inward
if left is at least right then return true
return whether deleting the left character or the right character leaves a palindrome`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Family line 3 is the endpoint comparison, line 5 is the return.
export const LINE_MAP = { 1: 1, 3: 2, 5: 5 }

export const python = `def valid_palindrome(s):
    def is_palindrome(i, j):
        while i < j:
            if s[i] != s[j]:
                return False
            i += 1
            j -= 1
        return True

    left, right = 0, len(s) - 1
    while left < right and s[left] == s[right]:
        left += 1
        right -= 1
    if left >= right:
        return True
    return is_palindrome(left + 1, right) or is_palindrome(left, right - 1)`
