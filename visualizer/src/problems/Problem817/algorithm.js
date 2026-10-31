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
  const push = (phase, activeLine, message, index = -1, extra = {}) => frames.push({ phase, activeLine, message, index, count, inRun, marks: [...marks], ...extra })
  push('start', L('set S to'), `Put nums in a set. A component is a maximal run of consecutive list nodes whose values are all in {${nums.join(', ')}}.`, -1, { pythonLine: 10 })
  head.forEach((v, i) => {
    if (S.has(v)) {
      if (!inRun) {
        count += 1; inRun = true
        marks[i] = 'start'
        push('open', L('add 1 to count'), `Node ${v} is in nums and the previous node was not: a new component begins. Count = ${count}.`, i, { pythonLine: 17 })
      } else {
        marks[i] = 'inside'
        push('extend', L('extends the current'), `Node ${v} is in nums and continues the current component. Count stays ${count}.`, i, { pythonLine: 16 })
      }
    } else {
      inRun = false
      marks[i] = 'gap'
      push('close', L('if cur.val is not in S'), `Node ${v} is not in nums, so any component ends here.`, i, { pythonLine: 20 })
    }
  })
  push('done', L('return count'), `${count} component${count === 1 ? '' : 's'}.`, -1, { pythonLine: 22 })
  return { input: { head, nums }, result: count, frames }
}
export const code = `set S to the set of values in nums
set count to 0, and set inRun to false
set cur to the head node
while cur is not empty
  if cur.val is not in S, set inRun to false
  otherwise if inRun is false, add 1 to count and set inRun to true
  otherwise the node extends the current component, so inRun stays true
  set cur to cur.next
return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def num_components(head, nums):
    first = None
    for v in reversed(head):
        first = ListNode(v, first)
    S = set(nums)
    count = 0
    in_run = False
    cur = first
    while cur:
        if cur.val in S:
            if not in_run:
                count += 1
                in_run = True
        else:
            in_run = False
        cur = cur.next
    return count
`
