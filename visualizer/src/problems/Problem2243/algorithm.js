export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s and k.')
  const { s, k } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 40 || !/^[0-9]+$/.test(s)) throw new Error('s is 1 to 40 digits.')
  if (!Number.isInteger(k) || k < 2 || k > 10) throw new Error('k is an integer from 2 to 10.')
  return { s, k }
}

export function buildTrace({ s, k }) {
  let current = s
  const frames = []
  frames.push({ pythonLine: PL('current = s'), phase: 'setup', activeLine: CL('let current'), round: 0, current, groups: [], message: `Start with ${s} and group size ${k}.` })
  let round = 0
  while (current.length > k) {
    round++
    let next = ''
    const groups = []
    for (let start = 0; start < current.length; start += k) {
      const part = current.slice(start, start + k)
      let sum = 0
      for (const ch of part) sum += Number(ch)
      next += String(sum)
      groups.push({ part, sum })
      frames.push({ pythonLine: PL('total = sum'), phase: 'group', activeLine: CL('let sum'), round, current, groups: [...groups], at: start, message: `Group ${part} sums to ${sum}.` })
    }
    current = next
    frames.push({ pythonLine: PL('current = nxt'), phase: 'merge', activeLine: CL('current = next'), round, current, groups: [...groups], at: -1, message: `Merged into ${current}${current.length > k ? ', which is still longer than ' + k + ', so repeat.' : '.'}` })
  }
  frames.push({ pythonLine: PL('return current'), phase: 'done', activeLine: CL('return current'), round, current, groups: [], at: -1, message: `The string has ${current.length} digit${current.length === 1 ? '' : 's'}, which is not longer than ${k}. Return ${current}.` })
  return { input: { s, k }, result: current, frames }
}

export const code = `function digitSumRounds(s, k) {
  let current = s;
  while (current.length > k) {
    let next = '';
    for (let start = 0; start < current.length; start += k) {
      let sum = 0;
      for (const ch of current.slice(start, start + k)) sum += Number(ch);
      next += String(sum);
    }
    current = next;
  }
  return current;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def digit_sum_rounds(s, k):
    current = s
    while len(current) > k:
        nxt = ""
        for start in range(0, len(current), k):
            total = sum(int(ch) for ch in current[start:start + k])
            nxt += str(total)
        current = nxt
    return current
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
