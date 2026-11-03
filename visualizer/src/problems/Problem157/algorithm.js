export const phases = [
  { id: 'start', label: 'Start', description: 'Set the goal: n characters are wanted, and the file pointer is at the beginning.' },
  { id: 'read4', label: 'Call read4', description: 'read4 hands over up to four characters and moves the file pointer past them.' },
  { id: 'copy', label: 'Copy to answer', description: 'Copy only as many characters as are still needed, never more than read4 returned.' },
  { id: 'end', label: 'End of file', description: 'Running out of characters ends the loop early, so nothing is read past the end.' },
  { id: 'done', label: 'Complete', description: 'Return the characters collected so far.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"file": "rhythm", "n": 4}.')
  const { file, n } = input
  if (typeof file !== 'string' || file.length > 20 || !/^[a-z]*$/.test(file)) throw new Error('file is a string of up to 20 lowercase letters.')
  if (!Number.isInteger(n) || n < 0 || n > 30) throw new Error('n is an integer from 0 to 30.')
  return { file, n }
}

export const code = [
  'function read(n):',
  '  total = 0, answer = empty',
  '  while total < n:',
  '    k = read4(buf4)',
  '    if k == 0: break',
  '    take = min(k, n - total)',
  '    copy buf4[0..take) onto answer',
  '    total = total + take',
  '    if k < 4: break',
  '  return answer',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def read(buf, n):
    total = 0
    buf4 = [''] * 4
    while total < n:
        k = read4(buf4)
        if k == 0:
            break
        take = min(k, n - total)
        buf[total:total + take] = buf4[:take]
        total += take
        if k < 4:
            break
    return total`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace({ file, n }) {
  let pointer = 0
  let answer = ''
  const snap = (extra = {}) => ({ pointer, answer, n, chunk: [], k: null, ...extra })
  const frames = [{ phase: 'start', activeLine: L('total = 0'), pythonLine: P('total = 0'), snapshot: snap(), message: `We want ${n} characters from a file of ${file.length}. read4 hands out at most four characters per call, so we call it in a loop.` }]
  while (answer.length < n) {
    const chunk = file.slice(pointer, pointer + 4)
    const k = chunk.length
    pointer += k
    frames.push({ phase: 'read4', activeLine: L('k = read4'), pythonLine: P('k = read4'), snapshot: snap({ chunk: [...chunk], k }), message: k ? `read4 returns ${k} character${k === 1 ? '' : 's'}: "${chunk}". The file pointer moves to ${pointer}.` : 'read4 returns 0, so the file is exhausted.' })
    if (k === 0) {
      frames.push({ phase: 'end', activeLine: L('if k == 0'), pythonLine: P('if k == 0'), snapshot: snap({ k }), message: `Nothing more to read, so we stop with ${answer.length} characters.` })
      break
    }
    const take = Math.min(k, n - answer.length)
    answer += chunk.slice(0, take)
    frames.push({ phase: 'copy', activeLine: L('copy buf4'), pythonLine: P('buf[total'), snapshot: snap({ chunk: [...chunk], k }), message: `Copy ${take} of the ${k} characters. The answer now has ${answer.length} of ${n}.` })
    if (k < 4) {
      frames.push({ phase: 'end', activeLine: L('if k < 4'), pythonLine: P('if k < 4'), snapshot: snap({ k }), message: 'read4 returned fewer than four, so the file ended here. Stop.' })
      break
    }
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), pythonLine: P('return total'), snapshot: snap(), message: `Return "${answer}".` })
  return { input: { file, n }, result: answer, frames }
}
