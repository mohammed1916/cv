export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || typeof input.s !== 'string') throw new Error('Use an object with s.')
  const { s } = input
  if (s.length < 1 || s.length > 24 || !/^[a-z]+$/.test(s)) throw new Error('s is 1 to 24 lowercase letters.')
  return { s }
}

export function buildTrace({ s }) {
  const frames = []
  let best = 1
  let run = 1
  let bestStart = 0
  let start = 0
  for (let i = 1; i < s.length; i++) {
    if (s.charCodeAt(i) === s.charCodeAt(i - 1) + 1) {
      run++
    } else {
      start = i
      run = 1
    }
    if (run > best) { best = run; bestStart = start }
    frames.push({ phase: run > 1 ? 'extend' : 'restart', activeLine: CL('run = run + 1'), pythonLine: PL('run += 1'), i, l: start, r: i, best, bestStart, message: run > 1 ? `${s[i]} follows ${s[i - 1]} in the alphabet, so the run ${start}..${i} has length ${run}.` : `${s[i]} does not follow ${s[i - 1]}, so a new run starts at ${i}.` })
  }
  frames.push({ phase: 'done', activeLine: CL('return best'), pythonLine: PL('return best'), i: -1, l: -1, r: -1, best, bestStart, message: `The longest run is ${s.slice(bestStart, bestStart + best)} with length ${best}.` })
  return { input: { s }, result: best, frames }
}

export const code = `function longestAlphabeticalRun(s) {
  let best = 1;
  let run = 1;
  for (let i = 1; i < s.length; i++) {
    if (s.charCodeAt(i) === s.charCodeAt(i - 1) + 1) {
      run = run + 1;
    } else {
      run = 1;
    }
    best = Math.max(best, run);
  }
  return best;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def longest_alphabetical_run(s):
    best = 1
    run = 1
    for i in range(1, len(s)):
        if ord(s[i]) == ord(s[i - 1]) + 1:
            run += 1
        else:
            run = 1
        best = max(best, run)
    return best
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
