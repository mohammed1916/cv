import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'

const code = [
  'pool = the list of trees',
  'while the pool has more than one tree',
  '  find a tree whose root value equals a leaf of another tree',
  '  replace that leaf with the tree and drop the tree from the pool',
  '  if no such tree exists, return null',
  'check that the single tree is a valid search tree',
  'return its in-order values, or null when invalid',
].map((text, index) => ({ line: index + 1, text }))

const python = `from copy import deepcopy

def merge_bsts(trees):
    pool = deepcopy(trees)
    def attach(node, root):
        for side in ("left", "right"):
            child = node[side]
            if child is None:
                continue
            if child["left"] is None and child["right"] is None and child["value"] == root["value"]:
                node[side] = root
                return True
            if attach(child, root):
                return True
        return False
    while len(pool) > 1:
        for i, root in enumerate(pool):
            if any(j != i and attach(other, root) for j, other in enumerate(pool)):
                pool.pop(i)
                break
        else:
            return None
    values = []
    def inorder(node):
        if node is None:
            return
        inorder(node["left"])
        values.append(node["value"])
        inorder(node["right"])
    inorder(pool[0])
    if any(a >= b for a, b in zip(values, values[1:])):
        return None
    return values
`

const PY = { pool: 4, loop: 16, find: 18, attach: 19, none: 22, check: 31, done: 33 }

const leaf = value => ({ value, left: null, right: null })
const tree = (value, left = null, right = null) => ({ value, left, right })

export function parse(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input?.trees) || input.trees.length < 1 || input.trees.length > 4) throw new Error('trees is a list of 1 to 4 nested {value, left, right} objects.')
  const check = node => {
    if (node === null) return
    if (!node || !Number.isInteger(node.value)) throw new Error('Each node needs an integer value.')
    check(node.left ?? null); check(node.right ?? null)
  }
  input.trees.forEach(t => check(t))
  return { trees: input.trees.map(t => JSON.parse(JSON.stringify(t))) }
}

export function build({ trees }) {
  const frames = []
  let pool = trees.map(t => JSON.parse(JSON.stringify(t)))
  const attach = (node, root) => {
    for (const side of ['left', 'right']) {
      const child = node[side]
      if (!child) continue
      if (!child.left && !child.right && child.value === root.value) {
        node[side] = root
        return true
      }
      if (attach(child, root)) return true
    }
    return false
  }
  const show = (message, phase, line, pythonLine, extra = {}) => frames.push({
    phase, activeLine: line, pythonLine, message, pool: pool.map(t => JSON.parse(JSON.stringify(t))), ...extra,
  })
  show('start', 1, PY.pool, `Start with ${pool.length} tree${pool.length === 1 ? '' : 's'}.`)
  let failed = false
  while (pool.length > 1) {
    show('loop', 2, PY.loop, `Pool has ${pool.length} trees.`)
    let merged = false
    for (let i = 0; i < pool.length && !merged; i++) {
      const root = pool[i]
      for (let j = 0; j < pool.length; j++) {
        if (j === i) continue
        if (attach(pool[j], root)) {
          show('attach', 4, PY.attach, `Tree rooted at ${root.value} fills a leaf of the tree at position ${j}.`, { focus: root.value })
          pool.splice(i, 1)
          merged = true
          break
        }
      }
    }
    if (!merged) {
      failed = true
      show('none', 5, PY.none, 'No root matches a leaf of another tree; the merge fails.')
      break
    }
  }
  let result = null
  if (!failed) {
    const values = []
    const inorder = node => { if (!node) return; inorder(node.left); values.push(node.value); inorder(node.right) }
    inorder(pool[0])
    const valid = values.every((v, i) => i === 0 || values[i - 1] < v)
    show('check', 6, PY.check, valid ? 'In-order values rise strictly: a valid search tree.' : 'In-order values do not rise: not a valid search tree.')
    result = valid ? values : null
  }
  show('done', 7, PY.done, result ? `Merged in-order values: ${result.join(', ')}.` : 'Result is null.')
  return { input: { trees }, result, frames }
}

const definition = {
  phases: [
    { id: 'start', label: 'Pool', description: 'The trees waiting to merge.' },
    { id: 'loop', label: 'Round', description: 'Look for a tree that fits a leaf.' },
    { id: 'attach', label: 'Attach', description: 'Plug a tree into a leaf.' },
    { id: 'none', label: 'Stuck', description: 'No tree fits.' },
    { id: 'check', label: 'Check', description: 'Validate the search order.' },
    { id: 'done', label: 'Result', description: 'Report the merged values or null.' },
  ],
  parse, build, code, python,
  inputLabel: 'Object with trees: nested {value, left, right} objects or null',
  url: 'https://leetcode.com/problems/merge-bsts-to-create-single-bst/',
  complexity: 'Each attach walks the tree it searches, so the visualization repeats that walk per candidate. The sample is capped at 4 trees.',
  examples: [
    { label: 'Two trees', input: '{"trees":[{"value":5,"left":{"value":3,"left":null,"right":null},"right":null},{"value":3,"left":{"value":1,"left":null,"right":null},"right":{"value":4,"left":null,"right":null}}]}' },
    { label: 'Stuck', input: '{"trees":[{"value":5,"left":{"value":1,"left":null,"right":null},"right":null},{"value":4,"left":null,"right":null}]}' },
  ],
}

function Tree({ node }) {
  if (!node) return null
  return <li>{node.value}{(node.left || node.right) && <ul>
    <Tree node={node.left} /><Tree node={node.right} />
  </ul>}</li>
}

export default function MergeBSTsToCreateSingleBST() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <div aria-label="Trees waiting to merge">{step.pool.map((t, i) => <ul key={i} className="algorithm-workspace__tree" data-tree={i}>
      <Tree node={t} />
    </ul>)}</div>
    {step.focus !== undefined && <output aria-label="Tree being attached">{`Attaching root ${step.focus}`}</output>}
  </>} renderReasoning={() => <>
    <p>A tree can join another only by taking the place of one of its leaves. Merging in any order works as long as each root has a matching leaf to fill.</p>
    <p>The finished tree is a valid search tree only when its in-order values strictly increase.</p>
  </>} />
}
