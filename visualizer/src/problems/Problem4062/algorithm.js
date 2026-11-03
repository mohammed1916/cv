// One operation on positions i and j keeps their pair sum fixed: the new values are
// (a[i] + a[j] - delta, delta). So the total never changes, and any split of the total is reachable.
// Construction: for each position k except the last, pick delta so that position k becomes target[k].
// The last position absorbs the remainder, which equals target[last] exactly when the totals match.

const MAX_LENGTH = 12

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with source and target arrays.')
  const { source, target } = input
  if (!Array.isArray(source) || !Array.isArray(target) || source.length !== target.length) throw new Error('source and target need equal lengths.')
  if (source.length < 2 || source.length > MAX_LENGTH) throw new Error('Arrays have 2 to 12 values in this visualization.')
  for (const v of [...source, ...target]) {
    if (!Number.isInteger(v) || v < -1000000000 || v > 1000000000) throw new Error('Values are integers from -1000000000 to 1000000000.')
  }
  return { source, target }
}

const sum = values => values.reduce((total, v) => total + v, 0)

export function buildTrace({ source, target }) {
  const n = source.length
  const frames = []
  const sourceSum = sum(source)
  const targetSum = sum(target)
  frames.push({
    phase: 'sum', activeLine: L('IF sums of source and target differ'), pythonLine: P('if sum(source) != sum(target)'),
    current: [...source], target, pair: null, sourceSum, targetSum, result: null,
    message: `Sums: source ${sourceSum}, target ${targetSum}.`,
  })
  if (sourceSum !== targetSum) {
    frames.push({
      phase: 'done', activeLine: L('RETURN false'), pythonLine: P('return False'),
      current: [...source], target, pair: null, sourceSum, targetSum, result: false,
      message: 'The totals differ, and every operation keeps the total, so the target is unreachable.',
    })
    return { input: { source, target }, result: false, frames }
  }
  const current = [...source]
  const last = n - 1
  for (let k = 0; k < last; k++) {
    const delta = current[k] + current[last] - target[k]
    current[k] = target[k]
    current[last] = delta
    frames.push({
      phase: 'transfer', activeLine: L('delta ← current[k]'), pythonLine: P('delta = current[k]'),
      current: [...current], target, pair: [k, last], sourceSum, targetSum, result: null,
      message: `Operate on (${k}, ${last}) with delta ${delta}: position ${k} becomes ${target[k]}, position ${last} holds the rest.`,
    })
  }
  const result = current[last] === target[last]
  frames.push({
    phase: 'done', activeLine: L('RETURN current[last]'), pythonLine: P('return current[last]'),
    current: [...current], target, pair: null, sourceSum, targetSum, result,
    message: result ? 'Every position matches the target.' : 'The last position does not match.',
  })
  return { input: { source, target }, result, frames }
}

export const code = `FUNCTION canTransform(source, target)
    IF sums of source and target differ THEN RETURN false
    current ← copy of source
    FOR each position k except the last
        delta ← current[k] + current[last] − target[k]
        current[k] ← target[k]; current[last] ← delta
    RETURN current[last] equals target[last]`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def can_transform(source, target):
    if sum(source) != sum(target):
        return False
    current = list(source)
    last = len(current) - 1
    for k in range(last):
        delta = current[k] + current[last] - target[k]
        current[k] = target[k]
        current[last] = delta
    return current[last] == target[last]


if __name__ == "__main__":
    import json
    import sys
    data = json.loads(sys.stdin.read())
    print(can_transform(data["source"], data["target"]))
`
