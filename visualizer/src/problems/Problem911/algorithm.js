export function parseInput(text) {
  const v = JSON.parse(text)
  if (!v || typeof v !== 'object' || !Array.isArray(v.persons) || !Array.isArray(v.times) || !Array.isArray(v.queries)) throw new Error('Enter {"persons": [0,1,1], "times": [0,5,10], "queries": [3,12]}.')
  const { persons, times, queries } = v
  if (!persons.length || persons.length > 60 || persons.length !== times.length) throw new Error('persons and times must have the same length, 1 to 60 (capped for visualization).')
  if (persons.some(p => !Number.isInteger(p) || p < 0 || p > 1000)) throw new Error('persons must be integers between 0 and 1000.')
  if (times.some((t, i) => !Number.isInteger(t) || t < 0 || t > 1000000 || (i && t <= times[i - 1]))) throw new Error('times must be strictly increasing integers up to 1,000,000.')
  if (queries.length > 40 || queries.some(t => !Number.isInteger(t) || t < times[0] || t > 1000000)) throw new Error('queries must be at most 40 integers, each at least times[0] and at most 1,000,000.')
  return { persons: [...persons], times: [...times], queries: [...queries] }
}
export function buildTrace({ persons, times, queries }) {
  const leaders = []
  const counts = {}
  let lead = -1
  const frames = [{ phase: 'start', activeLine: 4, vote: -1, leaders: [], counts: {}, qDone: 0, answers: [], message: 'Process the votes in time order, recording who leads after each one. Ties go to the most recent vote.' }]
  for (let i = 0; i < persons.length; i++) {
    const p = persons[i]
    counts[p] = (counts[p] ?? 0) + 1
    const takes = lead === -1 || counts[p] >= counts[lead]
    if (takes) lead = p
    leaders.push(lead)
    frames.push({ phase: 'vote', activeLine: takes ? 10 : 7, vote: i, leaders: [...leaders], counts: { ...counts }, qDone: 0, answers: [],
      message: `t=${times[i]}: person ${p} now has ${counts[p]} vote(s). ${takes ? `That ties or beats the leader, so ${p} leads.` : `The leader keeps the lead.`}` })
  }
  const answers = []
  queries.forEach((t, qi) => {
    let lo = 0, hi = times.length
    while (lo < hi) { const mid = (lo + hi) >> 1; if (times[mid] <= t) lo = mid + 1; else hi = mid }
    const i = lo - 1
    answers.push(leaders[i])
    frames.push({ phase: 'query', activeLine: 15, vote: i, leaders: [...leaders], counts: { ...counts }, qIndex: qi, qDone: qi + 1, answers: [...answers],
      message: `q(${t}): binary search finds the last vote at or before ${t}, index ${i} (time ${times[i]}); the leader then was ${leaders[i]}.` })
  })
  frames.push({ phase: 'done', activeLine: 15, vote: -1, leaders: [...leaders], counts: { ...counts }, qDone: queries.length, qIndex: queries.length - 1, answers: [...answers], message: `Answers: [${answers.join(', ')}].` })
  return { input: { persons, times, queries }, leaders, result: answers, frames }
}
export const code = `class TopVotedCandidate:
    def __init__(self, persons, times):
        self.times = times
        self.leaders = []
        counts = {}
        lead = -1
        for p in persons:
            counts[p] = counts.get(p, 0) + 1
            if lead == -1 or counts[p] >= counts[lead]:
                lead = p
            self.leaders.append(lead)

    def q(self, t):
        i = bisect_right(self.times, t) - 1
        return self.leaders[i]`.split('\n').map((text, index) => ({ line: index + 1, text }))
