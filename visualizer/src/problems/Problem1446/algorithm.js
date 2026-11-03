export const phases = [
  { id: 'start', label: 'Start first run', description: 'The first character begins a run of length one.' },
  { id: 'compare', label: 'Compare neighbours', description: 'Check whether this character matches the one just before it.' },
  { id: 'extend', label: 'Extend run', description: 'A match lengthens the current run by one.' },
  { id: 'restart', label: 'Restart run', description: 'A different character starts a new run of length one.' },
  { id: 'record', label: 'Record best', description: 'Keep the longer of the best run so far and the current run.' },
  { id: 'done', label: 'Result', description: 'Return the longest run found.' },
]

export const code = `function longestRun(s):
    best = 1
    run = 1
    for i from 1 to length(s) - 1:
        if s[i] equals s[i - 1]:
            run = run + 1
        else:
            run = 1
        best = max(best, run)
    return best`

export const python = `def longest_run(s):
    best = 1
    run = 1
    for i in range(1, len(s)):
        if s[i] == s[i - 1]:
            run += 1
        else:
            run = 1
        best = max(best, run)
    return best`

const lineOf = (source, fragment) => source.split('\n').findIndex(line => line.includes(fragment)) + 1
const C = fragment => lineOf(code, fragment)
const P = fragment => lineOf(python, fragment)

export function parseInput(text) {
  const s = String(text).trim()
  if (!/^[a-z]{1,200}$/.test(s)) throw new Error('Enter 1 to 200 lowercase letters with no spaces.')
  return s
}

export function buildTrace(s) {
  const frames = []
  let run = 1
  let best = 1
  const add = (phase, c, p, message, snapshot) => frames.push({ phase, activeLine: C(c), pythonLine: P(p), message, snapshot })
  const snap = (index, same = null) => ({ s, index, run, best, same })
  add('start', 'best = 1', 'best = 1', `Start with s[0] = '${s[0]}'. Its run has length 1, and so does the best run.`, snap(0))
  for (let i = 1; i < s.length; i++) {
    const same = s[i] === s[i - 1]
    add('compare', 'if s[i]', 'if s[i]', `Compare s[${i}] = '${s[i]}' with the previous character '${s[i - 1]}'. ${same ? 'They match.' : 'They differ.'}`, snap(i, same))
    if (same) {
      run += 1
      add('extend', 'run = run + 1', 'run += 1', `The run continues, so its length becomes ${run}.`, snap(i, same))
    } else {
      run = 1
      add('restart', 'else:', 'else:', `A new run starts at s[${i}], so its length resets to 1.`, snap(i, same))
    }
    best = Math.max(best, run)
    add('record', 'best = max', 'best = max', `The best run is now ${best}.`, snap(i, same))
  }
  add('done', 'return best', 'return best', `The longest run of one repeated character has length ${best}.`, snap(s.length - 1))
  return { input: s, result: best, frames }
}
