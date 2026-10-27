const BITS = 5

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use 1 to 12 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 30)) throw new Error('Each value is an integer from 1 to 30.')
  return nums
}

const newNode = () => ({ child: [null, null], count: 0 })

export function buildTrace(nums) {
  const sorted = [...nums].sort((a, b) => a - b)
  const root = newNode()
  const update = (v, delta) => {
    let node = root
    node.count += delta
    for (let b = BITS - 1; b >= 0; b--) {
      const bit = (v >> b) & 1
      if (!node.child[bit]) node.child[bit] = newNode()
      node = node.child[bit]
      node.count += delta
    }
  }
  // Largest xor of v with a value still counted in the trie.
  const bestWith = v => {
    let node = root
    let best = 0
    for (let b = BITS - 1; b >= 0; b--) {
      const want = 1 - ((v >> b) & 1)
      const child = node.child[want]
      if (child && child.count > 0) {
        best |= 1 << b
        node = child
      } else {
        node = node.child[1 - want]
      }
    }
    return best
  }
  let best = 0
  let left = 0
  const frames = [{ phase: 'start', activeLine: L('sort nums'), left: 0, right: -1, pair: null, best, message: 'Sort the numbers. The window starts empty.' }]
  sorted.forEach((v, right) => {
    update(v, 1)
    frames.push({ phase: 'add', activeLine: L('insert nums[r]'), left, right, pair: null, best, message: `Add ${v} to the window.` })
    while (v > 2 * sorted[left]) {
      update(sorted[left], -1)
      frames.push({ phase: 'shrink', activeLine: L('remove nums[left]'), left: left + 1, right, pair: null, best, message: `${sorted[left]} is too small to pair with ${v}, so drop it.` })
      left++
    }
    const candidate = bestWith(v)
    best = Math.max(best, candidate)
    frames.push({ phase: 'query', activeLine: L('find the largest xor'), left, right, pair: candidate, best, message: `Best xor for ${v} inside the window is ${candidate}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return best'), left, right: sorted.length, pair: null, best, message: `Maximum strong pair xor: ${best}.` })
  return { input: nums, result: best, frames }
}

export const code = `maximum xor over strong pairs, where |x - y| is at most min(x, y)
sort nums into ascending order and set left to 0 and best to 0
for each right index r do
  insert nums[r] into the trie with counts
  while nums[r] is more than twice nums[left] do
    remove nums[left] from the trie and move left forward
  find the largest xor of nums[r] with a value still in the trie and keep the best
return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_strong_pair_xor(nums):
    BITS = 5
    nums = sorted(nums)
    root = [None, None, 0]

    def update(v, delta):
        node = root
        node[2] += delta
        for b in range(BITS - 1, -1, -1):
            bit = (v >> b) & 1
            if node[bit] is None:
                node[bit] = [None, None, 0]
            node = node[bit]
            node[2] += delta

    def best_with(v):
        node = root
        res = 0
        for b in range(BITS - 1, -1, -1):
            want = 1 - ((v >> b) & 1)
            child = node[want]
            if child is not None and child[2] > 0:
                res |= 1 << b
                node = child
            else:
                node = node[1 - want]
        return res

    best = 0
    left = 0
    for right, v in enumerate(nums):
        update(v, 1)
        while v > 2 * nums[left]:
            update(nums[left], -1)
            left += 1
        best = max(best, best_with(v))
    return best
`
