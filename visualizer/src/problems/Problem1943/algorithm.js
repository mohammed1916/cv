// LeetCode 1943: sweep the number line over segment endpoints. The running sum of colours is the mixed colour; equal neighbouring sums merge, and empty gaps are skipped.
const SOURCE = [
  "function splitPainting(segments) {",
  "  const delta = new Map()",
  "  for (const [start, end, color] of segments) {",
  "    delta.set(start, (delta.get(start) || 0) + color)",
  "    delta.set(end, (delta.get(end) || 0) - color)",
  "  }",
  "  const positions = [...delta.keys()].sort((a, b) => a - b)",
  "  const painting = []",
  "  let total = 0",
  "  for (let i = 0; i < positions.length - 1; i++) {",
  "    total += delta.get(positions[i])",
  "    if (total > 0) {",
  "      const last = painting[painting.length - 1]",
  "      if (last && last[1] === positions[i] && last[2] === total) last[1] = positions[i + 1]",
  "      else painting.push([positions[i], positions[i + 1], total])",
  "    }",
  "  }",
  "  return painting",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def split_painting(segments):
    delta = {}
    for start, end, color in segments:
        delta[start] = delta.get(start, 0) + color
        delta[end] = delta.get(end, 0) - color
    positions = sorted(delta)
    total = 0
    painting = []
    for i in range(len(positions) - 1):
        total += delta[positions[i]]
        if total > 0:
            left, right = positions[i], positions[i + 1]
            if painting and painting[-1][1] == left and painting[-1][2] == total:
                painting[-1][1] = right
            else:
                painting.append([left, right, total])
    return painting
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'sweep', label: 'Sweep', description: 'Walk the endpoints left to right, tracking the mixed colour.' },
  { id: 'done', label: 'Result', description: 'The painting as mixed-colour segments.' },
]

export function parseInput(text) {
  let segments
  try { segments = JSON.parse(text) } catch { throw new Error('Enter a JSON array of [start, end, color], for example [[1,4,5],[1,7,7]].') }
  if (!Array.isArray(segments) || segments.length < 1 || segments.length > 6) throw new Error('Use 1 to 6 segments for the visualization.')
  if (!segments.every(s => Array.isArray(s) && s.length === 3 && Number.isInteger(s[0]) && Number.isInteger(s[1]) && s[0] >= 1 && s[1] > s[0] && s[1] <= 20 && Number.isInteger(s[2]) && s[2] >= 1 && s[2] <= 9)) throw new Error('Each segment is [start, end, color] with 1 <= start < end <= 20 and colour 1 to 9.')
  if (new Set(segments.map(s => s[2])).size !== segments.length) throw new Error('Colours are distinct.')
  return { segments }
}

export function buildTrace({ segments }) {
  const delta = new Map()
  for (const [start, end, color] of segments) {
    delta.set(start, (delta.get(start) || 0) + color)
    delta.set(end, (delta.get(end) || 0) - color)
  }
  const positions = [...delta.keys()].sort((a, b) => a - b)
  const frames = []
  const painting = []
  let total = 0
  for (let i = 0; i < positions.length - 1; i++) {
    total += delta.get(positions[i])
    const left = positions[i], right = positions[i + 1]
    if (total > 0) {
      const last = painting[painting.length - 1]
      if (last && last[1] === left && last[2] === total) { last[1] = right } else { painting.push([left, right, total]) }
      frames.push({ phase: 'sweep', activeLine: L('if (last && last[1] === positions[i]'), pythonLine: P('painting[-1][1] = right'), message: `From ${left} to ${right} the mixed colour sums to ${total}.`, left, right, total, painting: painting.map(p => [...p]), gap: false })
    } else {
      frames.push({ phase: 'sweep', activeLine: L('if (total > 0)'), pythonLine: P('if total > 0'), message: `From ${left} to ${right} nothing is painted.`, left, right, total, painting: painting.map(p => [...p]), gap: true })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return painting'), pythonLine: P('return painting'), message: `${painting.length} part(s) describe the painting.`, left: null, right: null, total: 0, painting: painting.map(p => [...p]), gap: false, result: painting })
  return { input: { segments }, result: painting, frames }
}
