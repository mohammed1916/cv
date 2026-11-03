const MOD = 1000000007n
const codeLines = `for each index i build the segment: nums1[i] ones then nums0[i] zeros
  val = (2^ones minus 1) times 2^zeros, len = ones + zeros
sort segments so that a comes first when
  val_a times (2^len_b minus 1) is larger than val_b times (2^len_a minus 1)
total = 0
for each segment in sorted order
  total = total times 2^len + val
return total modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text: text.trim() }))
const L = s => codeLines.findIndex(c => c.text.includes(s)) + 1
const pythonLines = `from functools import cmp_to_key
def max_value(nums1, nums0):
    segs = []
    for o, z in zip(nums1, nums0):
        ln = o + z
        val = ((1 << o) - 1) << z
        segs.append((val, ln))
    def cmp(a, b):
        left = a[0] * ((1 << b[1]) - 1)
        right = b[0] * ((1 << a[1]) - 1)
        return -1 if left > right else (1 if left < right else 0)
    total = 0
    for val, ln in sorted(segs, key=cmp_to_key(cmp)):
        total = (total << ln) + val
    return total % 1000000007`.split('\n')
const P = s => pythonLines.findIndex(t => t.includes(s)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.nums1) || !Array.isArray(input.nums0)) throw new Error('Use an object with nums1 and nums0.')
  const { nums1, nums0 } = input
  if (nums1.length !== nums0.length || nums1.length < 1 || nums1.length > 8) throw new Error('nums1 and nums0 have the same length, from 1 to 8 in this visual.')
  for (let i = 0; i < nums1.length; i++) {
    const o = nums1[i]
    const z = nums0[i]
    if (![o, z].every(x => Number.isInteger(x) && x >= 0 && x <= 8) || o + z < 1) throw new Error('Counts are integers from 0 to 8, and each segment has at least one bit.')
  }
  return { nums1, nums0 }
}

function segment(o, z) {
  return { ones: o, zeros: z, len: o + z, val: ((1n << BigInt(o)) - 1n) << BigInt(z) }
}

export function buildTrace({ nums1, nums0 }) {
  const segs = nums1.map((o, i) => ({ ...segment(o, nums0[i]), index: i }))
  const sorted = [...segs].sort((a, b) => {
    const left = a.val * ((1n << BigInt(b.len)) - 1n)
    const right = b.val * ((1n << BigInt(a.len)) - 1n)
    return left > right ? -1 : left < right ? 1 : 0
  })
  const frames = [{ phase: 'segments', activeLine: L('for each index i build'), pythonLine: P('segs.append'), order: [], total: 0n, current: null,
    message: `${segs.length} segment${segs.length === 1 ? '' : 's'} built.` }]
  let total = 0n
  const order = []
  for (const seg of sorted) {
    total = (total << BigInt(seg.len)) + seg.val
    order.push(seg)
    frames.push({ phase: 'place', activeLine: L('total = total times'), pythonLine: P('total = (total'), order: [...order], total, current: seg,
      message: `Place segment ${seg.index} (${seg.ones} ones, ${seg.zeros} zeros) at the end.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total modulo'), pythonLine: P('return total'), order: [...order], total, current: null,
    message: `Value modulo 1000000007 is ${total % MOD}.` })
  return { input: { nums1, nums0 }, result: Number(total % MOD), frames }
}

export const code = codeLines
export const python = pythonLines.join('\n')
