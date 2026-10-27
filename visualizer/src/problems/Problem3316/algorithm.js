const isSubsequence = (pattern, text) => {
  let j = 0
  for (const ch of text) if (j < pattern.length && ch === pattern[j]) j++
  return j === pattern.length
}

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with source, pattern and targetIndices.')
  const { source, pattern, targetIndices } = data
  if (typeof source !== 'string' || source.length < 1 || source.length > 16 || !/^[a-z]+$/.test(source)) throw new Error('source is 1 to 16 lowercase letters.')
  if (typeof pattern !== 'string' || pattern.length < 1 || pattern.length > source.length || !/^[a-z]+$/.test(pattern)) throw new Error('pattern is 1 to source-length lowercase letters.')
  if (!Array.isArray(targetIndices) || targetIndices.length > 12) throw new Error('targetIndices holds at most 12 indices.')
  targetIndices.forEach((v, i) => {
    if (!Number.isInteger(v) || v < 0 || v >= source.length) throw new Error('Each target index must be an index of source.')
    if (i > 0 && v <= targetIndices[i - 1]) throw new Error('targetIndices must be strictly increasing.')
  })
  if (!isSubsequence(pattern, source)) throw new Error('pattern must be a subsequence of source.')
  return { source, pattern, targetIndices }
}

export function buildTrace(input) {
  const { source, pattern, targetIndices } = input
  const m = pattern.length
  const targets = new Set(targetIndices)
  // best[j] is the fewest target indices a match of pattern[0..j) must keep, so far.
  const best = Array(m + 1).fill(Infinity)
  best[0] = 0
  const frames = [{ phase: 'start', activeLine: L('set best[0] to 0'), index: -1, best: [...best], message: `Matching the empty pattern keeps 0 targets. There are ${targetIndices.length} targets.` }]
  for (let i = 0; i < source.length; i++) {
    const cost = targets.has(i) ? 1 : 0
    // Scanning the pattern backwards means each source character extends a match at most once.
    for (let j = m - 1; j >= 0; j--) {
      if (source[i] === pattern[j] && best[j] + cost < best[j + 1]) best[j + 1] = best[j] + cost
    }
    frames.push({ phase: 'read', activeLine: L('for each index i'), index: i, best: [...best],
      message: `Character ${source[i]} at ${i} ${targets.has(i) ? 'is a target, so using it keeps one more' : 'is not a target, so using it is free'}. Fewest kept for the full pattern: ${best[m]}.` })
  }
  const kept = best[m]
  const result = targetIndices.length - kept
  frames.push({ phase: 'done', activeLine: L('return targets minus'), index: -1, best: [...best], message: `Delete every target the match does not keep: ${targetIndices.length} minus ${kept} gives ${result}.` })
  return { input, result, frames }
}

export const code = `remove as many targets as possible
  count the target indices
  set best[0] to 0 and every other best[j] to infinity
  for each index i of source from left to right
    set cost to 1 if i is a target, otherwise 0
    for j from the pattern length minus 1 down to 0
      if source at i equals pattern at j and best[j] plus cost is less than best[j + 1]
        set best[j + 1] to best[j] plus cost
  return targets minus best[pattern length]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_removals(source, pattern, targetIndices):
    targets = set(targetIndices)
    m = len(pattern)
    best = [0] + [float('inf')] * m
    for i, ch in enumerate(source):
        cost = 1 if i in targets else 0
        for j in range(m - 1, -1, -1):
            if ch == pattern[j] and best[j] + cost < best[j + 1]:
                best[j + 1] = best[j] + cost
    return len(targetIndices) - best[m]
`
