export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with no removal cost and the first group of equal colours.' },
  { id: 'group', label: 'Find group', description: 'Collect the run of adjacent items that share the same colour.' },
  { id: 'keep', label: 'Keep the costliest', description: 'Keep the most expensive item in the run and pay to remove the others.' },
  { id: 'remove', label: 'Pay removals', description: 'Add the run total minus the kept maximum to the cost.' },
  { id: 'done', label: 'Result', description: 'Return the minimum total removal time.' },
]

export const code = `FUNCTION minCost(colors, neededTime)
    total ← 0
    i ← 0
    WHILE i < length of colors
        j ← i; groupSum ← 0; best ← 0
        WHILE j < length AND colors[j] = colors[i]
            groupSum ← groupSum + neededTime[j]
            best ← max(best, neededTime[j])
            j ← j + 1
        total ← total + groupSum − best
        i ← j
    RETURN total`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def minCost(colors, neededTime):
    total = 0
    i = 0
    while i < len(colors):
        j = i
        group_sum = 0
        best = 0
        while j < len(colors) and colors[j] == colors[i]:
            group_sum += neededTime[j]
            best = max(best, neededTime[j])
            j += 1
        total += group_sum - best
        i = j
    return total`

export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 8, 7: 9, 8: 10, 9: 11, 10: 12, 11: 13, 12: 14 }

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch (error) { throw new Error(`Input must be valid JSON: ${error.message}`) }
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"colors": "aabaa", "neededTime": [1, 2, 3, 4, 1]}.')
  const { colors, neededTime } = input
  if (typeof colors !== 'string' || colors.length < 1 || colors.length > 30 || !/^[a-z]+$/.test(colors)) {
    throw new Error('colors is a string of 1 to 30 lowercase letters.')
  }
  if (!Array.isArray(neededTime) || neededTime.length !== colors.length || !neededTime.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) {
    throw new Error(`neededTime must list ${colors.length} integers from 1 to 1000, one per letter.`)
  }
  return { colors, neededTime }
}

export function buildTrace({ colors, neededTime }) {
  const n = colors.length
  let total = 0
  let i = 0
  const removed = []
  const frames = []
  const snap = extra => ({ start: -1, end: -1, j: -1, best: -1, total, removed: removed.slice(), ...extra })
  frames.push({ phase: 'start', activeLine: 2, message: 'Total starts at 0. Walk the string from the left.', snapshot: snap() })
  while (i < n) {
    let j = i
    let groupSum = 0
    let best = -1
    frames.push({ phase: 'group', activeLine: 5, message: `A group of "${colors[i]}" starts at index ${i}.`, snapshot: snap({ start: i }) })
    while (j < n && colors[j] === colors[i]) {
      groupSum += neededTime[j]
      if (best < 0 || neededTime[j] > neededTime[best]) best = j
      frames.push({ phase: 'keep', activeLine: 8, message: `Index ${j} costs ${neededTime[j]}; the kept item so far is index ${best} (cost ${neededTime[best]}).`, snapshot: snap({ start: i, j, best }) })
      j++
    }
    for (let k = i; k < j; k++) if (k !== best) removed.push(k)
    const pay = groupSum - neededTime[best]
    total += pay
    frames.push({ phase: 'remove', activeLine: 10, message: `Keep index ${best}; pay ${pay} to remove the rest. Total is ${total}.`, snapshot: snap({ start: i, end: j - 1, best, total }) })
    i = j
  }
  frames.push({ phase: 'done', activeLine: 12, message: `Return ${total}.`, snapshot: snap({ total }) })
  return { input: { colors, neededTime }, result: total, frames }
}
