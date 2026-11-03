// A day sequence is a list of scoring runs separated by skipped days. A run of length L earns 1+2+...+L points
// over L days. Let days[p] be the fewest days that score exactly p points. Adding a run of length L after
// a sequence scoring p - T(L) costs one skipped day plus L scoring days. The first run needs no skip,
// so days[0] is set to -1 to cancel that extra day.

const MAX_N = 60

const codeLines = [
  'days[0] is minus one, and days[p] is unknown for every other p',
  'for each total p from 1 to n',
  '  for each run length L while T(L) = L(L+1)/2 fits in p',
  '    candidate is days[p - T(L)] plus L plus one',
  '    keep the smallest candidate for days[p]',
  'return days[n]',
]

export const code = codeLines.map((text, index) => ({ line: index + 1, text }))

const L = fragment => {
  const index = codeLines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`Missing pseudocode line: ${fragment}`)
  return index + 1
}

const pythonLines = [
  'def min_days(n):',
  "    days = [float('inf')] * (n + 1)",
  '    days[0] = -1',
  '    for p in range(1, n + 1):',
  '        L = 1',
  '        while L * (L + 1) // 2 <= p:',
  '            candidate = days[p - L * (L + 1) // 2] + L + 1',
  '            if candidate < days[p]:',
  '                days[p] = candidate',
  '            L += 1',
  '    return days[n]',
]

export const python = pythonLines.join('\n') + '\n'

const P = fragment => {
  const index = pythonLines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`Missing python line: ${fragment}`)
  return index + 1
}

const tri = L => (L * (L + 1)) / 2

export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > MAX_N) throw new Error(`Enter a whole number from 1 to ${MAX_N}.`)
  return n
}

export function buildTrace(n) {
  const frames = []
  const days = Array(n + 1).fill(Infinity)
  const choice = Array(n + 1).fill(0)
  days[0] = -1
  const snapshot = () => days.map(d => (d === Infinity ? null : d))

  frames.push({ phase: 'start', pythonLine: P('days[0] = -1'), activeLine: L('days[0] is minus one'), p: 0, runLength: 0, candidate: null, days: snapshot(), choice: [...choice], message: 'Zero points take -1 day, so the first run pays no skip.' })

  for (let p = 1; p <= n; p++) {
    frames.push({ phase: 'total', pythonLine: P('for p in range'), activeLine: L('for each total p'), p, runLength: 0, candidate: null, days: snapshot(), choice: [...choice], message: `Find the fewest days to score exactly ${p}.` })
    for (let len = 1; tri(len) <= p; len++) {
      const prev = days[p - tri(len)]
      const candidate = prev + len + 1
      const improved = candidate < days[p]
      frames.push({ phase: 'consider', pythonLine: P('candidate = days'), activeLine: L('candidate is days'), p, runLength: len, candidate, prev, days: snapshot(), choice: [...choice], improved, message: `A run of ${len} earns ${tri(len)}: days[${p - tri(len)}] = ${Number.isFinite(prev) ? prev : 'unknown'}, so the candidate is ${candidate}.` })
      if (improved) {
        days[p] = candidate
        choice[p] = len
        frames.push({ phase: 'improve', pythonLine: P('days[p] = candidate'), activeLine: L('keep the smallest'), p, runLength: len, candidate, prev, days: snapshot(), choice: [...choice], improved, message: `days[${p}] becomes ${candidate} using a run of ${len}.` })
      }
    }
  }

  // Rebuild one optimal day sequence from the stored run lengths.
  const runs = []
  for (let p = n; p > 0; p -= tri(choice[p])) runs.unshift(choice[p])
  const strip = runs.map(len => 'S'.repeat(len)).join('.')
  frames.push({ phase: 'done', pythonLine: P('return days[n]'), activeLine: L('return days[n]'), p: n, runLength: 0, candidate: null, days: snapshot(), choice: [...choice], strip, runs, message: `Fewest days to score exactly ${n}: ${days[n]}. Runs ${runs.join(' + ')}; S scores, . skips.` })
  return { input: n, result: days[n], frames, runs, strip }
}
