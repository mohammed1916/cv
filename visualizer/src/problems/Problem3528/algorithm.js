const MOD = 1000000007

export function parseInput(text) {
  const conversions = JSON.parse(text)
  if (!Array.isArray(conversions) || conversions.length < 1 || conversions.length > 15) throw new Error('Use a JSON array of 1 to 15 conversions.')
  for (const row of conversions) {
    if (!Array.isArray(row) || row.length !== 3 || !row.every(Number.isInteger)) throw new Error('Each conversion is [source, target, factor] with integers.')
    const [source, target, factor] = row
    if (source < 0 || target < 0 || factor < 1 || factor > 10) throw new Error('Units are non-negative and factors are from 1 to 10.')
  }
  const n = conversions.length + 1
  // Arrows must point away from unit 0 and reach every unit, so the list is a tree rooted at 0.
  const reached = new Set([0])
  const sources = new Map()
  for (const [source, target] of conversions) {
    if (source >= n || target >= n) throw new Error(`Units must be between 0 and ${n - 1}.`)
    sources.set(target, source)
  }
  if (sources.size !== n - 1 || sources.has(0)) throw new Error('Each unit except 0 must be a target exactly once.')
  let grew = true
  while (grew) {
    grew = false
    for (const [source, target] of conversions) {
      if (reached.has(source) && !reached.has(target)) { reached.add(target); grew = true }
    }
  }
  if (reached.size !== n) throw new Error('Every unit must be reachable from unit 0 by the arrows.')
  return conversions
}

export function buildTrace(conversions) {
  const n = conversions.length + 1
  const frames = []
  const adjacent = Array.from({ length: n }, () => [])
  for (const [source, target, factor] of conversions) adjacent[source].push([target, factor])
  const result = Array(n).fill(0)
  result[0] = 1
  frames.push({ pythonLine: 9, phase: 'start', activeLine: L('const result = Array'), unit: 0, edge: null, queue: [0], result: [...result], message: 'Unit 0 is worth 1 of itself.' })
  const queue = [0]
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head]
    frames.push({ pythonLine: 12, phase: 'visit', activeLine: L('const node = queue[head]'), unit: node, edge: null, queue: queue.slice(head), result: [...result], message: `Visit unit ${node}, worth ${result[node]} base units per unit.` })
    for (const [target, factor] of adjacent[node]) {
      result[target] = (result[node] * factor) % MOD
      queue.push(target)
      frames.push({ pythonLine: 14, phase: 'relax', activeLine: L('result[target] = '), unit: node, edge: [node, target, factor], queue: queue.slice(head + 1), result: [...result],
        message: `1 unit of ${node} is ${factor} of ${target}, so ${target} gets ${result[target]}.` })
    }
  }
  frames.push({ pythonLine: 16, phase: 'done', activeLine: L('return result'), unit: null, edge: null, queue: [], result: [...result], message: 'Every unit has its base-unit count.' })
  return { input: conversions, result, frames }
}

export const code = `function unitConversions(n, conversions) {
  const MOD = 1000000007
  const adjacent = Array.from({ length: n }, () => [])
  for (const [source, target, factor] of conversions) adjacent[source].push([target, factor])
  const result = Array(n).fill(0)
  result[0] = 1
  const queue = [0]
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head]
    for (const [target, factor] of adjacent[node]) {
      result[target] = (result[node] * factor) % MOD
      queue.push(target)
    }
  }
  return result
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque

def unit_conversions(n, conversions):
    MOD = 1000000007
    adjacent = [[] for _ in range(n)]
    for source, target, factor in conversions:
        adjacent[source].append((target, factor))
    result = [0] * n
    result[0] = 1
    queue = deque([0])
    while queue:
        node = queue.popleft()
        for target, factor in adjacent[node]:
            result[target] = result[node] * factor % MOD
            queue.append(target)
    return result
`
