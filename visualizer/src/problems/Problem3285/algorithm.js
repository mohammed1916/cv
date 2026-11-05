export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with height and threshold.')
  const { height, threshold } = input
  if (!Array.isArray(height) || height.length < 3 || height.length > 12) throw new Error('height has 3 to 12 integers.')
  if (!height.every(h => Number.isInteger(h) && h >= 1 && h <= 100)) throw new Error('Each height is an integer from 1 to 100.')
  if (!Number.isInteger(threshold) || threshold < 1 || threshold > 100) throw new Error('threshold is an integer from 1 to 100.')
  return { height, threshold }
}

export function buildTrace({ height, threshold }) {
  const frames = []
  const stable = []
  frames.push({ pythonLine: PY('result = []'), phase: 'start', activeLine: L('const result = []'), index: -1, stable: [], message: `Check mountains 1 to ${height.length - 1} against threshold ${threshold}.` })
  for (let i = 1; i < height.length; i++) {
    const ok = height[i - 1] > threshold
    frames.push({ pythonLine: PY('if height[i - 1]'), phase: 'check', activeLine: L('if (height[i - 1] > threshold)'), index: i, stable: [...stable], ok,
      message: `Index ${i}: height[${i - 1}] = ${height[i - 1]} ${ok ? 'is above' : 'is not above'} ${threshold}.` })
    if (ok) {
      stable.push(i)
      frames.push({ pythonLine: PY('result.append'), phase: 'stable', activeLine: L('result.push(i)'), index: i, stable: [...stable], ok,
        message: `Index ${i} is stable.` })
    }
  }
  frames.push({ pythonLine: PY('return result'), phase: 'done', activeLine: L('return result'), index: -1, stable: [...stable], message: `Stable indices: ${stable.join(', ') || 'none'}.` })
  return { input: { height, threshold }, result: stable, frames }
}

export const code = `function findIndicesOfStableMountains(height, threshold) {
  const result = []
  for (let i = 1; i < height.length; i++) {
    if (height[i - 1] > threshold) result.push(i)
  }
  return result
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_indices_of_stable_mountains(height, threshold):
    result = []
    for i in range(1, len(height)):
        if height[i - 1] > threshold:
            result.append(i)
    return result
`
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1
