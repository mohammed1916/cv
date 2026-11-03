export const phases = [
  { id: 'setup', label: 'Start', description: 'Set the running total and the current run length to zero.' },
  { id: 'scan', label: 'Scan letters', description: 'Extend the run when a letter repeats the one before it, otherwise start a new run.' },
  { id: 'done', label: 'Complete', description: 'Return the total number of uniform substrings.' },
]

const CODE = [
  'function countUniform(s):',
  '  total = 0',
  '  run = 0',
  '  for i from 0 to n - 1:',
  '    if i > 0 and s[i] == s[i-1]: run += 1',
  '    else: run = 1',
  '    total += run',
  '  return total',
]
const PY = [
  'def count_uniform(s):',
  '    total = 0',
  '    run = 0',
  '    for i, ch in enumerate(s):',
  '        if i > 0 and ch == s[i - 1]:',
  '            run += 1',
  '        else:',
  '            run = 1',
  '        total += run',
  '    return total',
]

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n')

const L = { init: 2, loop: 4, extend: 5, reset: 6, add: 7, ret: 8 }
const P = { init: 2, loop: 4, extend: 5, reset: 8, add: 9, ret: 10 }

export function parseInput(text) {
  const s = String(text).trim()
  if (!/^[a-z]{1,50}$/.test(s)) throw new Error('Enter 1 to 50 lowercase letters a to z.')
  return s
}

export function buildTrace(s) {
  const frames = []
  let total = 0
  let run = 0
  const state = { s, index: null, letter: null, run: 0, total: 0 }
  const push = (phase, key, message) => frames.push({
    phase, activeLine: L[key], pythonLine: P[key], message,
    snapshot: { ...state },
  })

  push('setup', 'init', `Start with total 0. The text has ${s.length} letters.`)
  for (let i = 0; i < s.length; i++) {
    const extend = i > 0 && s[i] === s[i - 1]
    run = extend ? run + 1 : 1
    Object.assign(state, { index: i, letter: s[i], run })
    push('scan', extend ? 'extend' : 'reset', extend
      ? `s[${i}] is ${s[i]}, the same as the letter before it, so the run grows to ${run}.`
      : `s[${i}] is ${s[i]}, which starts a fresh run of length 1.`)
    total += run
    Object.assign(state, { total })
    push('scan', 'add', `Each substring that ends at index ${i} is uniform, and there are ${run} of them. Total is ${total}.`)
  }

  push('done', 'ret', `The text has ${total} substrings made of one repeated letter.`)
  return { input: s, result: total, frames }
}
