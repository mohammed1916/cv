export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.technique1) || !Array.isArray(input.technique2)) throw new Error('Use a JSON object with technique1 and technique2 arrays and an integer k.')
  const n = input.technique1.length
  if (n < 1 || n > 20 || input.technique2.length !== n) throw new Error('Both arrays need the same length from 1 to 20.')
  if ([...input.technique1, ...input.technique2].some(v => !Number.isInteger(v) || v < 1 || v > 1000)) throw new Error('Points are integers from 1 to 1000.')
  if (!Number.isInteger(input.k) || input.k < 0 || input.k > n) throw new Error('k must be an integer from 0 to n.')
  return input
}

export function buildTrace(input) {
  const { technique1: a, technique2: b, k } = input
  const gains = a.map((x, i) => x - b[i])
  const sorted = [...gains].sort((x, y) => y - x)
  let total = b.reduce((sum, v) => sum + v, 0)
  const frames = [{ phase: 'start', activeLine: L('total = sum'), index: -1, gain: null, total, sorted, message: `Start with every task on technique 2: ${total} points.` }]
  sorted.forEach((g, i) => {
    if (i < k || g > 0) {
      total += g
      frames.push({ phase: 'take', activeLine: L('if i is less than k'), index: i, gain: g, total, sorted, message: i < k ? `Move a task with gain ${g} to technique 1 (required by k).` : `Move a task with gain ${g} to technique 1 (it adds points).` })
    } else {
      frames.push({ phase: 'skip', activeLine: L('otherwise add the gain'), index: i, gain: g, total, sorted, message: `Keep the remaining tasks on technique 2 (gain ${g} does not help).` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return total'), index: -1, gain: null, total, sorted, message: `Maximum points: ${total}.` })
  return { input, result: total, frames, sorted }
}

export const code = `maximize points after choosing k tasks (technique1, technique2, k):
  total = sum of all technique2 values
  gains = technique1[i] minus technique2[i] for each task
  sort gains from largest to smallest
  for each position i in the sorted gains
    if i is less than k then add the gain to total
    otherwise add the gain to total only when it is positive
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximize_points_after_choosing_k_tasks(technique1, technique2, k):
    total = sum(technique2)
    gains = sorted((a - b for a, b in zip(technique1, technique2)), reverse=True)
    for i, g in enumerate(gains):
        if i < k or g > 0:
            total += g
    return total
`
