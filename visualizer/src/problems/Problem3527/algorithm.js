export const phases = [
  { id: 'start', label: 'Start', description: 'No answers have been counted yet.' },
  { id: 'day', label: 'New day', description: 'The seen set starts empty for each day.' },
  { id: 'repeat', label: 'Repeat', description: 'Already seen today, so it does not count again.' },
  { id: 'count', label: 'Count', description: 'First time today: add one to its count.' },
  { id: 'compare', label: 'Compare', description: 'Check this answer against the best so far.' },
  { id: 'keep', label: 'Best', description: 'This answer becomes the new best.' },
  { id: 'done', label: 'Result', description: 'Return the best answer.' },
]

const MAX_DAYS = 8
const MAX_PER_DAY = 10

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with responses.')
  const { responses } = input
  if (!Array.isArray(responses) || responses.length < 1 || responses.length > MAX_DAYS) throw new Error(`responses has 1 to ${MAX_DAYS} days here.`)
  for (const day of responses) {
    if (!Array.isArray(day) || day.length < 1 || day.length > MAX_PER_DAY) throw new Error(`Each day has 1 to ${MAX_PER_DAY} answers here.`)
    for (const word of day) {
      if (typeof word !== 'string' || !/^[a-z]{1,10}$/.test(word)) throw new Error('Each answer is 1 to 10 lowercase English letters.')
    }
  }
  return { responses }
}

export const code = `most common answer, each day counting an answer once
  make an empty count table
  for each day
    make an empty seen set
    for each word of the day
      if the word is already seen, skip it
      add it to seen and add 1 to its count
  set best to nothing
  for each word and count in the table
    if count beats best, or ties and word is alphabetically earlier
      make this word the best
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `def find_common_response(responses):
    counts = {}
    for day in responses:
        seen = set()
        for word in day:
            if word in seen:
                continue
            seen.add(word)
            counts[word] = counts.get(word, 0) + 1
    best = None
    for word, count in counts.items():
        if best is None or count > counts[best] or (count == counts[best] and word < best):
            best = word
    return best
`

export function buildTrace({ responses }) {
  const frames = []
  const counts = new Map()
  const marks = responses.map(day => day.map(() => 'pending'))
  let seen = []
  let best = null
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, day: -1, at: -1, seen: seen.slice(), counts: [...counts.entries()],
    marks: marks.map(row => row.slice()), best, bestCount: best === null ? null : counts.get(best), candidate: null, comparison: null, ...extra,
  })

  push('start', L('empty count table'), 2, 'The count table is empty. It will record how many days each answer appeared on.')
  responses.forEach((words, d) => {
    seen = []
    push('day', L('empty seen set'), 4, `Day ${d + 1} begins with an empty seen set, because a repeat only matters within its own day.`, { day: d })
    words.forEach((word, w) => {
      if (seen.includes(word)) {
        marks[d][w] = 'repeat'
        push('repeat', L('already seen'), 7, `"${word}" was already given on day ${d + 1}, so this repeat is ignored.`, { day: d, at: w, candidate: word })
        return
      }
      seen.push(word)
      counts.set(word, (counts.get(word) ?? 0) + 1)
      marks[d][w] = 'counted'
      push('count', L('add it to seen'), 9, `"${word}" is new for day ${d + 1}; its count rises to ${counts.get(word)}.`, { day: d, at: w, candidate: word })
    })
  })
  seen = []
  push('compare', L('set best to nothing'), 10, 'All days are counted. Now scan the table for the best answer.')
  for (const [word, count] of counts) {
    if (best === null) {
      push('compare', L('count beats best'), 12, `Nothing is the best yet, so "${word}" with ${count} takes the place.`, { candidate: word, comparison: 'first' })
      best = word
      push('keep', L('make this word'), 13, `Best is now "${word}" with ${count}.`, { candidate: word })
      continue
    }
    const held = counts.get(best)
    const wins = count > held || (count === held && word < best)
    const why = count > held ? `${count} is more than ${held}`
      : count < held ? `${count} is fewer than ${held}`
        : word < best ? `Both have ${count}, and "${word}" comes before "${best}"`
          : `Both have ${count}, but "${word}" comes after "${best}"`
    push('compare', L('count beats best'), 12, `${why}, so ${wins ? `"${word}" wins` : `"${best}" stays`}.`, { candidate: word, comparison: wins ? 'wins' : 'loses' })
    if (wins) {
      best = word
      push('keep', L('make this word'), 13, `Best is now "${word}" with ${count}.`, { candidate: word })
    }
  }
  push('done', L('return best'), 14, `Return "${best}", given on ${counts.get(best)} ${counts.get(best) === 1 ? 'day' : 'days'}.`)
  return { input: { responses }, result: best, frames }
}
