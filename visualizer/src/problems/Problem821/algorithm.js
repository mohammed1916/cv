export function parseInput(text) {
  const data = JSON.parse(text)
  const { s, c } = data ?? {}
  if (typeof s !== 'string' || s.length < 1 || s.length > 1000 || !/^[a-z]+$/.test(s)) throw new Error('s is 1–1,000 lowercase letters.')
  if (typeof c !== 'string' || c.length !== 1 || !s.includes(c)) throw new Error('c must be one letter that appears in s.')
  return { s, c }
}

const JS_LINES = [
  'function shortestToChar(s, c) {',
  '  const n = s.length, answer = new Array(n).fill(Infinity)',
  '  let prev = -Infinity // position of the last c seen so far',
  '  for (let i = 0; i < n; i++) {',
  '    if (s[i] === c) prev = i',
  '    answer[i] = i - prev // distance looking left',
  '  }',
  '  let next = Infinity // position of the next c to the right',
  '  for (let i = n - 1; i >= 0; i--) {',
  '    if (s[i] === c) next = i',
  '    answer[i] = Math.min(answer[i], next - i) // distance looking right',
  '  }',
  '  return answer',
  '}',
]
const PY_LINES = [
  'def shortest_to_char(s, c):',
  '    n = len(s)',
  '    answer = [float(\'inf\')] * n',
  '    prev = float(\'-inf\')',
  '    for i in range(n):',
  '        if s[i] == c:',
  '            prev = i',
  '        answer[i] = i - prev',
  '    nxt = float(\'inf\')',
  '    for i in range(n - 1, -1, -1):',
  '        if s[i] == c:',
  '            nxt = i',
  '        answer[i] = min(answer[i], nxt - i)',
  '    return answer',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Two sweeps: from the left, each position takes its distance to the last c; from the right, it takes the smaller of that and the distance to the next c.
export function buildTrace({ s, c }) {
  const n = s.length
  const answer = new Array(n).fill(Infinity)
  let prev = -Infinity
  const frames = [{ phase: 'start', i: -1, sweep: 'left', answer: [], activeLine: L('const n = s.length'), pythonLine: P('n = len(s)'), message: `Find the distance from each position to the nearest '${c}'.` }]
  for (let i = 0; i < n; i++) {
    if (s[i] === c) prev = i
    answer[i] = i - prev
    frames.push({ phase: 'left', i, sweep: 'left', answer: answer.map(v => (Number.isFinite(v) ? v : null)), activeLine: L('answer[i] = i - prev'), pythonLine: P('answer[i] = i - prev'), message: `From the left, position ${i} is ${answer[i]} from the last '${c}'.` })
  }
  let next = Infinity
  for (let i = n - 1; i >= 0; i--) {
    if (s[i] === c) next = i
    answer[i] = Math.min(answer[i], next - i)
    frames.push({ phase: 'right', i, sweep: 'right', answer: answer.map(v => (Number.isFinite(v) ? v : null)), activeLine: L('answer[i] = Math.min'), pythonLine: P('answer[i] = min'), message: `From the right, position ${i} keeps the smaller distance: ${answer[i]}.` })
  }
  frames.push({ phase: 'done', i: n - 1, sweep: 'done', answer: answer.slice(), result: answer, activeLine: L('return answer'), pythonLine: P('return answer'), message: 'Every position now has its nearest distance.' })
  return { input: { s, c }, result: answer, frames }
}
