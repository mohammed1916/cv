export function parseInput(text) {
  const spec = JSON.parse(text)
  if (!Array.isArray(spec.heights) || spec.heights.length < 1 || spec.heights.length > 30) throw new Error('Use 1 to 30 heights.')
  if (spec.heights.some(h => !Number.isInteger(h) || h < 0 || h > 20)) throw new Error('Heights are integers from 0 to 20.')
  if (!Number.isInteger(spec.volume) || spec.volume < 0 || spec.volume > 50) throw new Error('volume is an integer from 0 to 50.')
  if (!Number.isInteger(spec.k) || spec.k < 0 || spec.k >= spec.heights.length) throw new Error('k must be a valid index.')
  return spec
}

// Where one unit dropped at index k settles. Water moves left while the ground does not rise,
// then right if the left search found nothing lower than k.
export function landing(heights, k) {
  let index = k
  for (let i = k - 1; i >= 0 && heights[i] <= heights[i + 1]; i--) {
    if (heights[i] < heights[index]) index = i
  }
  if (index !== k) return { index, side: 'left' }
  for (let i = k + 1; i < heights.length && heights[i] <= heights[i - 1]; i++) {
    if (heights[i] < heights[index]) index = i
  }
  return { index, side: index === k ? 'here' : 'right' }
}

export function buildTrace(spec) {
  const heights = [...spec.heights]
  const frames = [{ phase: 'start', activeLine: L('heights = a copy'), pythonLine: 2, heights: [...heights], index: null, side: null, drop: 0, message: `Drop ${spec.volume} unit(s) of water at index ${spec.k}.` }]
  for (let drop = 1; drop <= spec.volume; drop++) {
    const { index, side } = landing(heights, spec.k)
    heights[index] += 1
    frames.push({ phase: 'drop', activeLine: L('add one unit of water'), pythonLine: 16, heights: [...heights], index, side, drop, message: `Unit ${drop} settles at index ${index} (${side}).` })
  }
  frames.push({ phase: 'done', activeLine: L('return heights'), pythonLine: 17, heights: [...heights], index: null, side: null, drop: spec.volume, message: 'All water has settled.' })
  return { input: spec, result: heights, frames }
}

export const code = `function pourWater(heights, volume, k):
  heights = a copy of the heights
  repeat volume times:
    index = k
    look left from k-1 down to 0 while the ground does not rise:
      if heights[i] is lower than heights[index] then index = i
    if index is still k then:
      look right from k+1 while the ground does not rise:
        if heights[i] is lower than heights[index] then index = i
    add one unit of water at index
  return heights`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def pour_water(heights, volume, k):
    heights = list(heights)
    for _ in range(volume):
        index = k
        for i in range(k - 1, -1, -1):
            if heights[i] > heights[i + 1]:
                break
            if heights[i] < heights[index]:
                index = i
        if index == k:
            for i in range(k + 1, len(heights)):
                if heights[i] > heights[i - 1]:
                    break
                if heights[i] < heights[index]:
                    index = i
        heights[index] += 1
    return heights`
