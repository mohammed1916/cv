// Treat each trust pair as a directed edge. The judge has no outgoing edges and n - 1 incoming edges, so count both
// for everyone in one pass over the pairs, then look for the one person who matches.
export const code = String.raw`function findJudge(n, trust) {
  const trusts = new Array(n + 1).fill(0); // outgoing edges: how many people each person trusts
  const trusted = new Array(n + 1).fill(0); // incoming edges: how many people trust each person
  for (const [a, b] of trust) {
    trusts[a]++;
    trusted[b]++;
  }
  for (let person = 1; person <= n; person++) {
    if (trusts[person] === 0 && trusted[person] === n - 1) return person; // the judge
  }
  return -1;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`Missing JavaScript line for "${s}"`); return i + 1 }

export const python = String.raw`def find_judge(n, trust):
    trusts = [0] * (n + 1)  # outgoing edges: how many people each person trusts
    trusted = [0] * (n + 1)  # incoming edges: how many people trust each person
    for a, b in trust:
        trusts[a] += 1
        trusted[b] += 1
    for person in range(1, n + 1):
        if trusts[person] == 0 and trusted[person] == n - 1:
            return person  # the judge
    return -1`
const PYL = python.split('\n')
const PY = s => { const i = PYL.findIndex(t => t.includes(s)); if (i < 0) throw new Error(`Missing Python line for "${s}"`); return i + 1 }

export const phases = [
  { id: 'count', label: 'Count edges', description: 'Count who each person trusts and who trusts each person.' },
  { id: 'scan', label: 'Check people', description: 'Look for the person who trusts nobody and is trusted by everyone else.' },
  { id: 'done', label: 'Answer', description: 'The judge, or -1 if there is none.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  const n = input && input.n
  const trust = input && input.trust
  if (!Number.isInteger(n) || n < 1 || n > 8) throw new Error('n must be an integer from 1 to 8.')
  if (!Array.isArray(trust) || trust.length > 20) throw new Error('Use trust: a list of at most 20 [a, b] pairs.')
  const seen = new Set()
  for (const pair of trust) {
    if (!Array.isArray(pair) || pair.length !== 2 || pair.some(p => !Number.isInteger(p) || p < 1 || p > n) || pair[0] === pair[1]) {
      throw new Error('Each pair must be [a, b] with two different people from 1 to n.')
    }
    const key = pair.join(',')
    if (seen.has(key)) throw new Error('Trust pairs must be unique.')
    seen.add(key)
  }
  return { n, trust }
}

export function buildTrace({ n, trust }) {
  const trusts = new Array(n + 1).fill(0)
  const trusted = new Array(n + 1).fill(0)
  const frames = []
  const snapshot = () => Array.from({ length: n }, (_, i) => ({ person: i + 1, trusts: trusts[i + 1], trusted: trusted[i + 1] }))
  for (const [a, b] of trust) {
    trusts[a]++
    trusted[b]++
    frames.push({ phase: 'count', activeLine: L('trusts[a]++'), pythonLine: PY('trusts[a] += 1'), rows: snapshot(), current: null, judge: null,
      message: `${a} trusts ${b}: ${a} now trusts ${trusts[a]}, and ${b} is trusted by ${trusted[b]}.` })
  }
  let judge = -1
  for (let person = 1; person <= n; person++) {
    const match = trusts[person] === 0 && trusted[person] === n - 1
    frames.push({ phase: match ? 'done' : 'scan', activeLine: L(match ? 'return person' : 'if (trusts[person] === 0'), pythonLine: PY(match ? 'return person' : 'if trusts[person] == 0'), rows: snapshot(), current: person, judge: match ? person : null,
      message: match ? `${person} trusts nobody and is trusted by ${n - 1} people, so ${person} is the judge.`
        : `${person} trusts ${trusts[person]} and is trusted by ${trusted[person]}. That is not the judge pattern.` })
    if (match) { judge = person; break }
  }
  if (judge === -1) frames.push({ phase: 'done', activeLine: L('return -1'), pythonLine: PY('return -1'), rows: snapshot(), current: null, judge: -1, message: 'Nobody matches the pattern, so there is no judge.' })
  return { input: { n, trust }, result: judge, frames }
}
