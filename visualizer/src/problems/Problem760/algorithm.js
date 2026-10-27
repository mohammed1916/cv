export function parseInput(text) {
  const spec = JSON.parse(text)
  const { nums1, nums2 } = spec
  if (!Array.isArray(nums1) || !Array.isArray(nums2) || nums1.length !== nums2.length || nums1.length < 1 || nums1.length > 20) {
    throw new Error('Use two arrays of the same length, 1 to 20.')
  }
  const integers = [...nums1, ...nums2].every(v => Number.isInteger(v) && Math.abs(v) <= 100)
  if (!integers) throw new Error('Values are integers from -100 to 100.')
  const sorted = a => [...a].sort((x, y) => x - y).join(',')
  if (sorted(nums1) !== sorted(nums2)) throw new Error('nums2 must be a permutation of nums1.')
  return spec
}

export function buildTrace(spec) {
  const { nums1, nums2 } = spec
  const positions = new Map()
  nums2.forEach((v, i) => {
    if (!positions.has(v)) positions.set(v, [])
    positions.get(v).push(i)
  })
  const mapping = []
  const frames = [{ phase: 'index', activeLine: L('positions = {}'), i: null, value: null, index: null, mapping: [], message: 'Record where each value sits in nums2. A repeated value takes its positions in order.' }]
  nums1.forEach((v, i) => {
    const index = positions.get(v).shift()
    mapping.push(index)
    frames.push({ phase: 'map', activeLine: L('mapping.append'), i, value: v, index, mapping: [...mapping], message: `${v} at position ${i} of nums1 maps to index ${index} of nums2.` })
  })
  frames.push({ phase: 'done', activeLine: L('return mapping'), i: null, value: null, index: null, mapping: [...mapping], message: `The mapping is ${mapping.join(', ')}.` })
  return { input: spec, nums1, nums2, result: mapping, frames }
}

export const code = `def anagramMappings(nums1, nums2):
    positions = {}
    for i, v in enumerate(nums2):
        positions.setdefault(v, []).append(i)
    mapping = []
    for v in nums1:
        mapping.append(positions[v].pop(0))
    return mapping`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
