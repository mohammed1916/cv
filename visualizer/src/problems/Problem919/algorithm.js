export function parseInput(text) {
  const v = JSON.parse(text)
  if (!v || typeof v !== 'object' || !Array.isArray(v.tree) || !Array.isArray(v.ops)) throw new Error('Enter {"tree": [1,2], "ops": [["insert",3],["get_root"]]}. The tree is a complete tree in level order (no nulls).')
  const { tree, ops } = v
  if (!tree.length || tree.some(x => !Number.isInteger(x) || x < 0 || x > 5000)) throw new Error('tree must be 1+ integers between 0 and 5000 listed in level order (a complete tree has no gaps).')
  if (ops.length > 30 || ops.some(o => !Array.isArray(o) || (o[0] === 'insert' ? o.length !== 2 || !Number.isInteger(o[1]) || o[1] < 0 || o[1] > 5000 : !(o[0] === 'get_root' && o.length === 1)))) throw new Error('ops must be at most 30 entries, each ["insert", value] or ["get_root"].')
  if (tree.length + ops.filter(o => o[0] === 'insert').length > 63) throw new Error('The tree may hold at most 63 nodes in total (capped for visualization).')
  return { tree: [...tree], ops: ops.map(o => [...o]) }
}
const at = s => code.findIndex(c => c.text.includes(s)) + 1
export function buildTrace({ tree, ops }) {
  const values = [...tree]
  const candidates = []
  const frames = [{ phase: 'start', activeLine: at('self.candidates = deque()'), values: [...values], candidates: [], node: -1, newNode: -1, opIndex: -1, returned: [], message: 'Scan the existing tree in level order and remember every node that still has a free child slot.' }]
  for (let i = 0; i < values.length; i++) {
    const hasLeft = 2 * i + 1 < values.length, hasRight = 2 * i + 2 < values.length
    if (!hasLeft || !hasRight) candidates.push(i)
    frames.push({ phase: 'scan', activeLine: at('if not node.left or not node.right'), values: [...values], candidates: [...candidates], node: i, newNode: -1, opIndex: -1, returned: [],
      message: `Node ${values[i]}: ${hasLeft && hasRight ? 'both children present, not a candidate.' : `${hasLeft ? 'left child present' : 'no left child'}, ${hasRight ? 'right child present' : 'no right child'}: add to the candidate queue.`}` })
  }
  const returned = []
  ops.forEach((op, opIndex) => {
    if (op[0] === 'get_root') {
      returned.push(values[0])
      frames.push({ phase: 'root', activeLine: at('return self.root'), values: [...values], candidates: [...candidates], node: 0, newNode: -1, opIndex, returned: [...returned], message: `get_root returns the root, ${values[0]}.` })
      return
    }
    const parent = candidates[0]
    const hadLeft = 2 * parent + 1 < values.length
    const child = values.length
    values.push(op[1])
    if (hadLeft) candidates.shift()
    candidates.push(child)
    returned.push(values[parent])
    frames.push({ phase: 'insert', activeLine: hadLeft ? at('node.right = child') : at('node.left = child'), values: [...values], candidates: [...candidates], node: parent, newNode: child, opIndex, returned: [...returned],
      message: `insert(${op[1]}): the front candidate is ${values[parent]}. ${hadLeft ? 'It already has a left child, so the new node becomes its right child and the parent leaves the queue' : 'It has no left child, so the new node becomes its left child and the parent stays in the queue'}. The new node joins the back of the queue. Returns ${values[parent]}.` })
  })
  frames.push({ phase: 'done', activeLine: at('return self.root'), values: [...values], candidates: [...candidates], node: -1, newNode: -1, opIndex: ops.length - 1, returned: [...returned], message: `Returned values: [${returned.join(', ')}].` })
  return { input: { tree, ops }, result: returned, finalValues: values, frames }
}
export const code = `class CBTInserter:
    def __init__(self, root):
        self.root = root
        self.candidates = deque()
        q = deque([root])
        while q:
            node = q.popleft()
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
            if not node.left or not node.right:
                self.candidates.append(node)

    def insert(self, val):
        node = self.candidates[0]
        child = TreeNode(val)
        if not node.left:
            node.left = child
        else:
            node.right = child
            self.candidates.popleft()
        self.candidates.append(child)
        return node.val

    def get_root(self):
        return self.root`.split('\n').map((text, index) => ({ line: index + 1, text }))
