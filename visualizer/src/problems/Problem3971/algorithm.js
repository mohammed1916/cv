const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.value) || !Array.isArray(data.decay) || !Number.isInteger(data.m)) {
    throw new Error('Use {"value": [...], "decay": [...], "m": m}.')
  }
  const { value, decay, m } = data
  if (value.length < 1 || value.length > 6 || value.length !== decay.length) throw new Error('value and decay must have the same length, 1 to 6.')
  if (value.some(v => !Number.isInteger(v) || v < 1 || v > 9)) throw new Error('value entries are integers from 1 to 9.')
  if (decay.some(v => !Number.isInteger(v) || v < 1 || v > 9)) throw new Error('decay entries are integers from 1 to 9.')
  if (m < 1 || m > 12) throw new Error('m is an integer from 1 to 12 for the visualization.')
  return { value, decay, m }
}

export function buildTrace(input) {
  const { value, decay, m } = input
  const gain = [...value]
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('let heap be'), index: -1, gain: [...gain], total, message: `Each index starts with gain value[i]. Pick the largest gain up to ${m} times.` }]
  for (let step = 0; step < m; step++) {
    let best = 0
    for (let i = 1; i < gain.length; i++) if (gain[i] > gain[best]) best = i
    if (gain[best] <= 0) {
      frames.push({ phase: 'stop', activeLine: L('if gain is at most 0'), index: best, gain: [...gain], total, message: `The best remaining gain is ${gain[best]}, so stop.` })
      break
    }
    total += gain[best]
    const taken = gain[best]
    gain[best] -= decay[best]
    frames.push({ phase: 'pick', activeLine: L('replace that gain'), index: best, gain: [...gain], total, message: `Pick index ${best} for gain ${taken}. Its next gain is ${gain[best]}. Total ${total}.` })
  }
  const result = total % MOD
  frames.push({ phase: 'done', activeLine: L('return total modulo'), index: -1, gain: [...gain], total, message: `Maximum total value: ${result}.` })
  return { input, result, frames }
}

export const code = `maximum total value from at most m selections
  let heap be the first gain of each index, which is value[i]
  let total be 0
  repeat m times
    let gain be the largest gain in heap
    if gain is at most 0 then stop
    add gain to total
    replace that gain in heap with gain minus decay of its index
  return total modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_total_value(value, decay, m):
    import heapq
    MOD = 10 ** 9 + 7
    heap = [(-v, i) for i, v in enumerate(value)]
    heapq.heapify(heap)
    total = 0
    for _ in range(m):
        if not heap:
            break
        neg, i = heapq.heappop(heap)
        gain = -neg
        if gain <= 0:
            break
        total += gain
        heapq.heappush(heap, (-(gain - decay[i]), i))
    return total % MOD
`
