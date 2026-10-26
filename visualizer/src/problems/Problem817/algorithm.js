export function parseInput(text) {
  const d = JSON.parse(text)
  const bad = () => new Error('Enter JSON {"head": [0,1,2,3], "nums": [0,1,3]}: 1-20 distinct integers in [0, 99] for head (visualization cap), and nums a non-empty list of distinct values taken from head.')
  if (!d || typeof d !== 'object' || !Array.isArray(d.head) || !Array.isArray(d.nums)) throw bad()
  const { head, nums } = d
  const isV = v => Number.isInteger(v) && v >= 0 && v <= 99
  if (head.length < 1 || head.length > 20 || !head.every(isV) || new Set(head).size !== head.length) throw bad()
  if (nums.length < 1 || !nums.every(isV) || new Set(nums).size !== nums.length || !nums.every(v => head.includes(v))) throw bad()
  return { head: [...head], nums: [...nums] }
}
export function buildTrace({ head, nums }) {
  const S = new Set(nums)
  const frames = []
  let count = 0, inRun = false
  const marks = head.map(() => '')
  const push = (phase, activeLine, message, index = -1) => frames.push({ phase, activeLine, message, index, count, inRun, marks: [...marks] })
  push('start', 2, `Put nums in a set. A component is a maximal run of consecutive list nodes whose values are all in {${nums.join(', ')}}.`)
  head.forEach((v, i) => {
    if (S.has(v)) {
      if (!inRun) {
        count += 1; inRun = true
        marks[i] = 'start'
        push('open', 9, `Node ${v} is in nums and the previous node was not: a new component begins. Count = ${count}.`, i)
      } else {
        marks[i] = 'inside'
        push('extend', 7, `Node ${v} is in nums and continues the current component. Count stays ${count}.`, i)
      }
    } else {
      inRun = false
      marks[i] = 'gap'
      push('close', 12, `Node ${v} is not in nums, so any component ends here.`, i)
    }
  })
  push('done', 14, `${count} component${count === 1 ? '' : 's'}.`)
  return { input: { head, nums }, result: count, frames }
}
export const code = `def numComponents(head, nums):
    S = set(nums)
    count = 0
    in_run = False
    cur = head
    while cur:
        if cur.val in S:
            if not in_run:
                count += 1
                in_run = True
        else:
            in_run = False
        cur = cur.next
    return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
