export function parseInput(text) {
  const count = JSON.parse(text)
  if (!Array.isArray(count) || count.length !== 256) throw new Error('Use an array of exactly 256 counts, one for each value 0 to 255.')
  if (count.some(v => !Number.isInteger(v) || v < 0 || v > 60)) throw new Error('Each count is an integer from 0 to 60 for this visualization.')
  const total = count.reduce((a, b) => a + b, 0)
  if (total < 1 || total > 200) throw new Error('Use between 1 and 200 samples in total.')
  const top = Math.max(...count)
  if (count.filter(v => v === top).length !== 1) throw new Error('The mode must be unique.')
  return count
}

export function buildTrace(count) {
  const total = count.reduce((a, b) => a + b, 0)
  // The sample at sorted position k: walk the counts until more than k samples have been seen.
  const at = k => { let seen = 0; for (let v = 0; v < 256; v++) { seen += count[v]; if (seen > k) return v } return -1 }
  let low = null, high = null, weighted = 0, mode = 0, best = -1
  const frames = [{ phase: 'start', activeLine: L('set total'), value: null, message: `There are ${total} samples. Scan the values from 0 to 255.` }]
  for (let v = 0; v < 256; v++) {
    const c = count[v]
    if (c === 0) continue
    if (low === null) low = v
    high = v
    weighted += v * c
    if (c > best) { best = c; mode = v }
    frames.push({ phase: 'scan', activeLine: L('add the value times its count'), value: v, message: `${c} sample(s) of ${v}. Running sum ${weighted}, smallest ${low}, largest ${high}, mode ${mode}.` })
  }
  const mean = weighted / total
  const median = total % 2 === 1 ? at((total - 1) / 2) : (at(total / 2 - 1) + at(total / 2)) / 2
  const result = [low, high, mean, median, mode]
  frames.push({ phase: 'median', activeLine: L('median is'), value: null, message: `Mean is ${mean}. The middle sample gives median ${median}.` })
  frames.push({ phase: 'done', activeLine: L('return low'), value: null, message: `Statistics: [${result.join(', ')}].` })
  return { input: count, result, frames }
}

export const code = `statistics from counts of values 0 to 255:
  set total to the sum of all counts
  set low, high, weighted and mode to unset
  for each value v from 0 to 255 that has a count
    if low is unset then set low to v
    set high to v
    add the value times its count to weighted
    if this count is more than the best count then set mode to v
  mean is weighted divided by total
  median is the middle sample in sorted order, averaged with the next one when total is even
  return low, high, mean, median and mode`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sample_statistics(count):
    total = sum(count)
    low = None
    high = None
    weighted = 0
    mode = None
    best = -1
    for v in range(256):
        c = count[v]
        if c == 0:
            continue
        if low is None:
            low = v
        high = v
        weighted += v * c
        if c > best:
            best = c
            mode = v
    mean = weighted / total

    def at(k):
        seen = 0
        for v in range(256):
            seen += count[v]
            if seen > k:
                return v

    if total % 2 == 1:
        median = at((total - 1) // 2)
    else:
        median = (at(total // 2 - 1) + at(total // 2)) / 2
    return [low, high, mean, median, mode]
`
