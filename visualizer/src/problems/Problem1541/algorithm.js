export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || typeof obj.s !== 'string') throw new Error('Use an object with a string s.')
  const { s } = obj
  if (s.length < 1 || s.length > 20) throw new Error('s has 1 to 20 characters.')
  if (!/^[()]+$/.test(s)) throw new Error('Use only ( and ) characters.')
  return { s }
}

export function buildTrace(input) {
  const { s } = input
  const n = s.length
  let ans = 0
  let open = 0
  let i = 0
  const frames = [{ phase: 'start', activeLine: L('set ans to 0'), i: -1, ans, open, message: 'Scan the string with no open brackets waiting.' }]
  while (i < n) {
    if (s[i] === '(') {
      open++
      frames.push({ phase: 'open', activeLine: L('increase open by one'), i, ans, open, message: `Open bracket at ${i}; ${open} now waiting for two close brackets.` })
      i++
    } else if (i + 1 < n && s[i + 1] === ')') {
      i += 2
      if (open > 0) open--
      else ans++
      frames.push({ phase: 'pair', activeLine: L('move i forward by two'), i, ans, open, message: `Close brackets at ${i - 2} and ${i - 1} form a pair.` })
    } else {
      ans++
      i++
      frames.push({ phase: 'single', activeLine: L('add one to ans and move i'), i: i - 1, ans, open, message: 'A single close bracket needs another close bracket inserted.' })
      if (open > 0) open--
      else ans++
    }
  }
  ans += 2 * open
  frames.push({ phase: 'done', activeLine: L('return ans'), i: n, ans, open: 0, message: `Insertions needed: ${ans}.` })
  return { input, result: ans, frames }
}

export const code = `minimum insertions to balance a parentheses string
  set ans to 0, open to 0 and i to 0
  while i is less than the length of s do
    if s[i] is an open bracket then
      increase open by one and move i forward by one
    else if s[i] and s[i+1] are both close brackets then
      move i forward by two
      if open is above 0 then decrease open by one otherwise add one to ans
    otherwise
      add one to ans and move i forward by one
      if open is above 0 then decrease open by one otherwise add one to ans
  add two times open to ans
  return ans`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_insertions(s):
    ans = 0
    open_count = 0
    i = 0
    n = len(s)
    while i < n:
        if s[i] == '(':
            open_count += 1
            i += 1
        elif i + 1 < n and s[i + 1] == ')':
            i += 2
            if open_count > 0:
                open_count -= 1
            else:
                ans += 1
        else:
            ans += 1
            i += 1
            if open_count > 0:
                open_count -= 1
            else:
                ans += 1
    ans += 2 * open_count
    return ans
`
