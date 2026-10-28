const DELTA = { minute: 60, hour: 3600, day: 86400 }
const NAME = /^[a-z]{1,5}$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.ops) || input.ops.length < 1 || input.ops.length > 12) throw new Error('Use {"ops": [...]} with 1 to 12 operations.')
  for (const op of input.ops) {
    if (!Array.isArray(op)) throw new Error('Each operation is an array such as ["record", "tweet", 10].')
    if (op[0] === 'record' && op.length === 3 && NAME.test(op[1]) && Number.isInteger(op[2]) && op[2] >= 0 && op[2] <= 200) continue
    if (op[0] === 'query' && op.length === 5 && ['minute', 'hour', 'day'].includes(op[1]) && NAME.test(op[2]) && Number.isInteger(op[3]) && Number.isInteger(op[4]) && op[3] >= 0 && op[3] <= op[4] && op[4] <= 200) continue
    throw new Error('Use ["record", name, time] or ["query", "minute" | "hour" | "day", name, start, end] with times from 0 to 200.')
  }
  return { ops: input.ops }
}

// First index whose value is at least x (lower) or above x (upper).
const lowerBound = (list, x) => {
  let lo = 0
  let hi = list.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (list[mid] < x) lo = mid + 1
    else hi = mid
  }
  return lo
}
const upperBound = (list, x) => {
  let lo = 0
  let hi = list.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (list[mid] <= x) lo = mid + 1
    else hi = mid
  }
  return lo
}

export function buildTrace({ ops }) {
  const times = new Map()
  const log = []
  const results = []
  const frames = [{ phase: 'start', activeLine: L('start with no recorded times'), op: -1, bucket: null, counts: [], message: 'No tweets are recorded yet.' }]
  ops.forEach((op, index) => {
    if (op[0] === 'record') {
      const [, name, time] = op
      const list = times.get(name) ?? []
      list.splice(upperBound(list, time), 0, time)
      times.set(name, list)
      log.push({ name: 'recordTweet', args: [name, time], returned: undefined })
      frames.push({ phase: 'record', activeLine: L('insert its time'), op: index, bucket: null, counts: [], message: `Insert time ${time} into the sorted times for ${name}.` })
    } else {
      const [, freq, name, start, end] = op
      const delta = DELTA[freq]
      const list = times.get(name) ?? []
      const counts = []
      for (let low = start; low <= end; low += delta) {
        const high = Math.min(low + delta - 1, end)
        counts.push(upperBound(list, high) - lowerBound(list, low))
        frames.push({ phase: 'bucket', activeLine: L('count the times in the bucket'), op: index, bucket: [low, high], counts: [...counts], message: `Bucket ${low} to ${high} holds ${counts[counts.length - 1]} tweets.` })
      }
      log.push({ name: 'getTweetCountsPerFrequency', args: [freq, name, start, end], returned: counts })
      results.push(counts)
      frames.push({ phase: 'query', activeLine: L('add the answer list'), op: index, bucket: null, counts, message: `Query returns ${JSON.stringify(counts)}.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return every result'), op: null, bucket: null, counts: [], message: `Results: ${JSON.stringify(results)}.` })
  return { input: { ops }, log, result: results, frames }
}

export const code = `tweet counts per frequency
  start with no recorded times
  for each operation in order
    if the operation records a tweet then
      insert its time into the sorted times for that name
    otherwise
      set the bucket length from the frequency
      for each bucket from the start time to the end time
        count the times in the bucket with two binary searches
      add the answer list to the results
  return every result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def tweet_counts(ops):
    import bisect
    delta_by_freq = {'minute': 60, 'hour': 3600, 'day': 86400}
    times = {}
    results = []
    for op in ops:
        if op[0] == 'record':
            bisect.insort(times.setdefault(op[1], []), op[2])
        else:
            freq, name, start, end = op[1], op[2], op[3], op[4]
            delta = delta_by_freq[freq]
            values = times.get(name, [])
            counts = []
            low = start
            while low <= end:
                high = min(low + delta - 1, end)
                counts.append(bisect.bisect_right(values, high) - bisect.bisect_left(values, low))
                low += delta
            results.append(counts)
    return results
`
