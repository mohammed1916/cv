const ERROR = 'Enter {"flowers":[[start,end],...],"people":[t,...]} with 1 to 10 flowers and 1 to 10 arrival times. Each flower has 1 <= start <= end <= 20, and each arrival time is from 1 to 25.'

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || !Array.isArray(value.flowers) || !Array.isArray(value.people)) throw new Error(ERROR)
  const { flowers, people } = value
  if (flowers.length < 1 || flowers.length > 10 || people.length < 1 || people.length > 10) throw new Error(ERROR)
  const flowersOk = flowers.every(f => Array.isArray(f) && f.length === 2 && Number.isInteger(f[0]) && Number.isInteger(f[1]) && f[0] >= 1 && f[0] <= f[1] && f[1] <= 20)
  const peopleOk = people.every(t => Number.isInteger(t) && t >= 1 && t <= 25)
  if (!flowersOk || !peopleOk) throw new Error(ERROR)
  return { flowers, people }
}

export const code = `count the flowers in bloom when each person arrives
starts = all flower start times, sorted
ends = all flower end times, sorted
answer = empty list
for each arrival time t in people
  started = number of starts that are at most t
  ended = number of ends that are before t
  add started - ended to answer
return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ flowers, people }) {
  const starts = flowers.map(f => f[0]).sort((a, b) => a - b)
  const ends = flowers.map(f => f[1]).sort((a, b) => a - b)
  const answer = []
  const frames = [{ phase: 'start', activeLine: L('starts = all flower start'), person: -1, started: 0, ended: 0, answer: [], message: `Sort the starts [${starts.join(', ')}] and the ends [${ends.join(', ')}] separately. A flower is in bloom at t when its start is at most t and its end is at least t.` }]
  people.forEach((t, i) => {
    const started = starts.filter(s => s <= t).length
    const ended = ends.filter(e => e < t).length
    answer.push(started - ended)
    frames.push({ phase: 'person', activeLine: L('started = number of starts'), person: i, started, ended, answer: [...answer], message: `Arrival at ${t}: ${started} flower(s) have started, ${ended} have already ended, so ${started - ended} are in bloom.` })
  })
  frames.push({ phase: 'done', activeLine: L('return answer'), person: -1, started: 0, ended: 0, answer: [...answer], message: `Flowers in bloom for each person: [${answer.join(', ')}].` })
  return { input: { flowers, people }, result: answer, frames }
}

export const python = `from bisect import bisect_left, bisect_right

def full_bloom_counts(flowers, people):
    starts = sorted(s for s, _ in flowers)
    ends = sorted(e for _, e in flowers)
    answer = []
    for t in people:
        started = bisect_right(starts, t)
        ended = bisect_left(ends, t)
        answer.append(started - ended)
    return answer
`
