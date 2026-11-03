const lookup = (lines, text) => {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums1 and nums2.')
  const { nums1, nums2 } = input
  for (const [name, values] of [['nums1', nums1], ['nums2', nums2]]) {
    if (!Array.isArray(values) || values.length < 1 || values.length > 12) throw new Error(`${name} has 1 to 12 values.`)
    if (!values.every(value => Number.isInteger(value) && value >= 0 && value <= 9)) throw new Error(`${name} values are digits from 0 to 9.`)
  }
  if (nums1.length !== nums2.length) throw new Error('nums1 and nums2 need the same length.')
  return { nums1, nums2 }
}

const rotateRight = (values, shift) => values.map((_, i) => values[(i - shift + values.length) % values.length])

export function buildTrace({ nums1, nums2 }) {
  const n = nums1.length
  const L = text => lookup(code.map(line => line.text), text)
  const PY = text => lookup(python.split('\n'), text)
  const counts = Array(n).fill(null)
  const frames = []
  let best = 0
  let bestShift = 0
  frames.push({ pythonLine: PY('best = 0'), phase: 'start', activeLine: L('set best to 0'), shift: -1, index: -1, src: -1,
    count: 0, best, bestShift, match: null, shifted: nums1.slice(), counts: counts.slice(),
    message: `Compare ${n} right shift${n === 1 ? '' : 's'} of nums1 against nums2.` })
  for (let k = 0; k < n; k++) {
    let count = 0
    const shifted = rotateRight(nums1, k)
    frames.push({ pythonLine: PY('for k in range(n)'), phase: 'shift', activeLine: L('for each shift k'), shift: k, index: -1, src: -1,
      count, best, bestShift, match: null, shifted, counts: counts.slice(),
      message: `Shift ${k}: nums1 has moved right by ${k} position${k === 1 ? '' : 's'}.` })
    for (let i = 0; i < n; i++) {
      const src = (i - k + n) % n
      const hit = nums1[src] === nums2[i]
      if (hit) count += 1
      frames.push({ pythonLine: PY('if nums1[src] == nums2[i]'), phase: hit ? 'match' : 'miss', activeLine: L('if nums1 at src equals nums2 at i'),
        shift: k, index: i, src, count, best, bestShift, match: hit, shifted, counts: counts.slice(),
        message: `Index ${i}: nums1[${src}] = ${nums1[src]} ${hit ? 'equals' : 'differs from'} nums2[${i}] = ${nums2[i]}.` })
    }
    counts[k] = count
    if (count > best) {
      best = count
      bestShift = k
    }
    frames.push({ pythonLine: PY('if count > best'), phase: 'record', activeLine: L('if count is greater than best'), shift: k, index: -1, src: -1,
      count, best, bestShift, match: null, shifted, counts: counts.slice(),
      message: `Shift ${k} gives ${count} match${count === 1 ? '' : 'es'}; best is now ${best}.` })
  }
  frames.push({ pythonLine: PY('return best'), phase: 'done', activeLine: L('return best'), shift: -1, index: -1, src: -1,
    count: best, best, bestShift, match: null, shifted: nums1.slice(), counts: counts.slice(),
    message: `Largest count is ${best}, reached at shift ${bestShift}.` })
  return { input: { nums1, nums2 }, result: best, frames }
}

export const code = `maximum matching indices after right shifts of nums1
  let n be the common length
  set best to 0
  for each shift k from 0 to n minus 1
    set count to 0
    for each index i from 0 to n minus 1
      let src be (i minus k) mod n
      if nums1 at src equals nums2 at i then add 1 to count
    if count is greater than best then set best to count
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_matching_after_shifts(nums1, nums2):
    n = len(nums1)
    best = 0
    for k in range(n):
        count = 0
        for i in range(n):
            src = (i - k) % n
            if nums1[src] == nums2[i]:
                count += 1
        if count > best:
            best = count
    return best
`
