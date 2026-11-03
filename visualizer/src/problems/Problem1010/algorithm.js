export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"time": [30, 90, 150]}.')
  const { time } = input
  if (!Array.isArray(time) || time.length < 1 || time.length > 24 || !time.every(v => Number.isInteger(v) && v >= 1 && v <= 500)) throw new Error('time is a list of 1 to 24 integers from 1 to 500.')
  return { time }
}

export function buildTrace({ time }) {
  const counts = Array(60).fill(0)
  const nonzero = () => counts.map((count, remainder) => ({ remainder, count })).filter(bucket => bucket.count > 0)
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('counts = 60'), pythonLine: P('counts = [0]'), message: 'Sixty remainder buckets start empty. Each song is paired only with earlier songs.', state: { index: -1, song: null, remainder: null, need: null, partners: 0, total, buckets: [] } }]

  time.forEach((song, index) => {
    const remainder = song % 60
    const need = (60 - remainder) % 60
    const partners = counts[need]
    total += partners
    frames.push({ phase: 'pair', activeLine: L('total += counts[need]'), pythonLine: P('total += counts'), message: `Song ${song} has remainder ${remainder}, so it needs remainder ${need}. ${partners} earlier song(s) fit.`, state: { index, song, remainder, need, partners, total, buckets: nonzero() } })
    counts[remainder] += 1
    frames.push({ phase: 'add', activeLine: L('counts[r] += 1'), pythonLine: P('counts[r] += 1'), message: `Add song ${song} to bucket ${remainder} for later songs to use.`, state: { index, song, remainder, need, partners, total, buckets: nonzero() } })
  })

  frames.push({ phase: 'done', activeLine: L('return total'), pythonLine: P('return total'), message: `Total pairs: ${total}.`, state: { index: -1, song: null, remainder: null, need: null, partners: 0, total, buckets: nonzero() } })
  return { input: { time }, result: total, frames }
}

export const code = `pairs divisible by sixty (time):
  counts = 60 empty buckets
  total = 0
  for each duration t in time:
    r = t mod 60
    need = (60 - r) mod 60
    total += counts[need]
    counts[r] += 1
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def num_pairs_divisible_by_60(time):
    counts = [0] * 60
    total = 0
    for t in time:
        r = t % 60
        need = (60 - r) % 60
        total += counts[need]
        counts[r] += 1
    return total
`
