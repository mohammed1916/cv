export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || !/^[a-z]{1,10}$/.test(s)) throw new Error('Use a JSON string of 1 to 10 lowercase letters.')
  return s
}

export function buildTrace(s) {
  const unread = new Array(26).fill(0)
  for (const c of s) unread[c.charCodeAt(0) - 97]++
  const t = []
  let paper = ''
  const frames = [{ phase: 'start', activeLine: L('set t to'), stack: [], paper: '', message: 'Start with an empty stack t and empty paper.' }]
  for (const c of s) {
    t.push(c)
    unread[c.charCodeAt(0) - 97]--
    frames.push({ phase: 'move', activeLine: L('move c onto'), stack: [...t], paper, message: `Move ${c} from s onto t.` })
    const index = unread.findIndex(count => count > 0)
    const smallest = index === -1 ? '{' : String.fromCharCode(97 + index)
    frames.push({ phase: 'check', activeLine: L('let smallest'), stack: [...t], paper, smallest: index === -1 ? null : smallest, message: index === -1 ? 'No letters are unread, so t can be emptied.' : `The smallest unread letter is ${smallest}.` })
    while (t.length && t[t.length - 1] <= smallest) {
      paper += t.pop()
      frames.push({ phase: 'print', activeLine: L('print the top'), stack: [...t], paper, message: `The top of t is no larger than ${smallest}, so print it.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return paper'), stack: [], paper, message: `Printed: ${paper}.` })
  return { input: s, result: paper, frames }
}

export const code = `build the smallest string the robot can print from s
count how many times each letter is still unread in s
set t to an empty stack and paper to an empty string
for each character c of s do
  move c onto the top of t
  decrease the unread count of c
  let smallest be the least letter still unread, or a brace if none
  while t is not empty and its top is at most smallest do
    print the top of t onto paper
return paper`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_paper_string(s):
    unread = [0] * 26
    for c in s:
        unread[ord(c) - 97] += 1
    t = []
    paper = []
    for c in s:
        t.append(c)
        unread[ord(c) - 97] -= 1
        smallest = next((chr(97 + i) for i in range(26) if unread[i] > 0), '{')
        while t and t[-1] <= smallest:
            paper.append(t.pop())
    return ''.join(paper)
`
