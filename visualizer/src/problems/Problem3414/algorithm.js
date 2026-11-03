export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.intervals)) throw new Error('Use an object with an intervals list.')
  const { intervals } = input
  if (intervals.length < 1 || intervals.length > 10) throw new Error('intervals holds 1 to 10 triples for this visualization.')
  for (const triple of intervals) {
    if (!Array.isArray(triple) || triple.length !== 3 || !triple.every(Number.isInteger)) throw new Error('Each interval is [start, end, weight] with integers.')
    const [start, end, weight] = triple
    if (start < 1 || end < start || weight < 1) throw new Error('Each interval needs 1 <= start <= end and weight >= 1.')
  }
  return { intervals }
}

// Two intervals overlap when they share any point, including a shared endpoint.
const overlaps = (a, b) => !(a[1] < b[0] || b[1] < a[0])

// Lexicographic order on index lists; a shorter list that is a prefix sorts first.
function lexLess(a, b) {
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i] < b[i]
  return a.length < b.length
}

export function buildTrace({ intervals }) {
  const frames = []
  let best = null
  const chosen = []
  const snapshot = () => (best ? best.chosen.slice() : null)
  const frame = (fields) => frames.push({ chosen: chosen.slice(), best: snapshot(), bestScore: best ? best.score : 0, ...fields })
  const score = () => chosen.reduce((sum, i) => sum + intervals[i][2], 0)

  frame({ pythonLine: 3, phase: 'start', activeLine: L('try every set'), at: -1, message: `Consider sets of up to 4 non-overlapping intervals out of ${intervals.length}.` })

  const dfs = (start) => {
    for (let i = start; i < intervals.length; i++) {
      if (chosen.length === 4) return
      if (chosen.some(j => overlaps(intervals[i], intervals[j]))) {
        frame({ pythonLine: 6, phase: 'reject', activeLine: L('skip any interval'), at: i, message: `Interval ${i} overlaps the chosen set, so it cannot be added.` })
        continue
      }
      chosen.push(i)
      const total = score()
      const beats = best === null || total > best.score || (total === best.score && lexLess(chosen, best.chosen))
      if (beats) best = { score: total, chosen: chosen.slice() }
      frame({ pythonLine: 9, phase: 'pick', activeLine: L('add interval'), at: i, message: `Set [${chosen.join(', ')}] has score ${total}.${beats ? ' It becomes the best so far.' : ''}` })
      dfs(i + 1)
      chosen.pop()
    }
  }
  dfs(0)

  frame({ pythonLine: 12, phase: 'done', activeLine: L('return the best set'), at: -1, message: `Best set is [${best.chosen.join(', ')}] with score ${best.score}.` })
  return { input: { intervals }, result: best.chosen, score: best.score, frames }
}

export const code = `choose up to 4 non-overlapping intervals with the largest weight sum
  start with an empty set and an empty best
  for each set of indices in increasing order, up to 4 long
    if the set has no overlapping pair
      if its score beats the best, or ties and is lexicographically smaller, keep it
  return the best index list`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_score_intervals(intervals):
    n = len(intervals)
    best_score = 0
    best = None
    chosen = []

    def overlaps(a, b):
        return not (a[1] < b[0] or b[1] < a[0])

    def search(start):
        nonlocal best_score, best
        for i in range(start, n):
            if len(chosen) == 4:
                return
            if any(overlaps(intervals[i], intervals[j]) for j in chosen):
                continue
            chosen.append(i)
            total = sum(intervals[j][2] for j in chosen)
            if best is None or total > best_score or (total == best_score and chosen < best):
                best_score = total
                best = list(chosen)
            search(i + 1)
            chosen.pop()

    search(0)
    return best
`
