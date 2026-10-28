import { parseLevelOrderTree } from '../../components/shared/levelOrderTree.js';
import { binaryTreeLayout } from '../../components/shared/binaryTreeLayout.js';

export function buildFlattenStory(text) {
  const root = parseLevelOrderTree(text);
  const layout = binaryTreeLayout(root);
  if (layout.nodes.length > 200) throw new Error('Use at most 200 nodes for this pointer trace.');
  const links = Object.fromEntries(layout.nodes.map(n => [n.id, { left: n.left?.id ?? null, right: n.right?.id ?? null }]));
  const values = new Map(layout.nodes.map(n => [n.id, n.val]));
  const frames = [], settled = [];
  let cur = root?.id ?? null, pre = null;
  const snapshot = (activeLine, phase, message, changed = null) => frames.push({
    activeLine, phase, message, cur, pre, changed, settled: [...settled],
    links: Object.fromEntries(Object.entries(links).map(([id, link]) => [id, { ...link }])),
  });
  snapshot(2, 'init', root ? 'Keep node identities fixed while changing their pointers.' : 'Empty tree: nothing to flatten.');
  while (cur !== null) {
    snapshot(4, 'check', `Inspect ${values.get(cur)}: ${links[cur].left === null ? 'no left subtree to move.' : 'move its left subtree ahead of its right subtree.'}`);
    if (links[cur].left !== null) {
      pre = links[cur].left;
      snapshot(6, 'visit', 'Start at the left child; find its rightmost connection point.');
      while (links[pre].right !== null) {
        pre = links[pre].right;
        snapshot(7, 'visit', `Follow the right pointer to ${values.get(pre)}.`);
      }
      links[pre].right = links[cur].right;
      snapshot(9, 'update', 'Save the old right subtree after the left subtree. No node is discarded.', { from: pre, side: 'right', to: links[pre].right });
      links[cur].right = links[cur].left;
      snapshot(11, 'update', 'Point current.right at the former left child. Both pointers temporarily share that child.', { from: cur, side: 'right', to: links[cur].right });
      links[cur].left = null;
      snapshot(12, 'update', 'Clear current.left. This node now has its final preorder successor.', { from: cur, side: 'left', to: null });
    }
    settled.push(cur);
    cur = links[cur].right;
    pre = null;
    snapshot(13, 'visit', cur === null ? 'Reached the end of the right chain.' : `Advance to ${values.get(cur)} along the right pointer.`);
  }
  snapshot(13, 'done', 'Every left pointer is null. The right chain follows the original preorder.');
  return { ...layout, rootId: root?.id ?? null, frames };
}

// ─── Statement-driven contract: parseInput / buildTrace / code / python ───
const MAX_NODES = 200
export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Input must be JSON, e.g. {"root": [1,2,5,3,4,null,6]}.') }
  if (!data || typeof data !== 'object' || Array.isArray(data) || !Array.isArray(data.root)) throw new Error('Input must be an object with a "root" array.')
  const root = data.root
  if (root.length > MAX_NODES) throw new Error(`Use at most ${MAX_NODES} slots for this trace.`)
  if (root.length > 0 && root[0] === null) throw new Error('The root slot cannot be null when the tree is non-empty.')
  for (const v of root) if (v !== null && (!Number.isInteger(v) || v < -100 || v > 100)) throw new Error('Values must be integers from -100 to 100 or null.')
  return { root }
}

// Build left/right index arrays from a level-order list (slot index = node id).
function levelOrderLinks(root) {
  const n = root.length, left = Array(n).fill(null), right = Array(n).fill(null)
  if (n === 0) return { left, right }
  const queue = [0]; let next = 1
  for (let head = 0; head < queue.length; head++) {
    const i = queue[head]
    for (const side of ['left', 'right']) {
      const slot = next++
      if (slot < n && root[slot] !== null) { (side === 'left' ? left : right)[i] = slot; queue.push(slot) }
    }
  }
  return { left, right }
}

export function buildTrace(input) {
  const root = input.root
  const { left, right } = levelOrderLinks(root)
  const frames = [], settled = []
  let cur = root.length ? 0 : null, pre = null
  const snap = (activeLine, phase, message, changed = null) => frames.push({
    activeLine, phase, message, cur, pre, changed, settled: [...settled],
    links: left.map((l, i) => ({ left: l, right: right[i] })), values: [...root],
  })
  snap(L('cur = root'), 'init', root.length ? 'Start at the root and keep the node identities fixed.' : 'Empty tree: nothing to flatten.')
  while (cur !== null) {
    snap(L('if cur has a left child'), 'check', left[cur] === null ? `Node ${root[cur]} has no left child; move on.` : `Node ${root[cur]} has a left child to splice.`)
    if (left[cur] !== null) {
      pre = left[cur]
      snap(L('find the rightmost node'), 'visit', 'Walk to the rightmost node of the left subtree.')
      while (right[pre] !== null) { pre = right[pre]; snap(L('find the rightmost node'), 'visit', `Follow right to ${root[pre]}.`) }
      right[pre] = right[cur]
      snap(L('attach the old right'), 'update', `Attach the old right subtree after ${root[pre]}.`, { from: pre, side: 'right', to: right[pre] })
      right[cur] = left[cur]
      snap(L('move the left subtree'), 'update', `Move the left subtree to the right of ${root[cur]}.`, { from: cur, side: 'right', to: right[cur] })
      left[cur] = null
      snap(L('clear cur.left'), 'update', `Clear the left pointer of ${root[cur]}.`, { from: cur, side: 'left', to: null })
    }
    settled.push(cur)
    cur = right[cur]; pre = null
    snap(L('cur = cur.right'), 'visit', cur === null ? 'Reached the end of the chain.' : `Advance to ${root[cur]}.`)
  }
  const result = []
  for (let id = root.length ? 0 : null; id !== null; id = right[id]) result.push(root[id])
  snap(L('return the right chain'), 'done', 'Every left pointer is null; the right chain is the flattened list.')
  return { input, result, frames }
}

export const code = [
  { line: 1, text: 'flatten the tree in place' },
  { line: 2, text: 'cur = root' },
  { line: 3, text: 'while cur is not empty' },
  { line: 4, text: 'if cur has a left child' },
  { line: 5, text: 'find the rightmost node of the left subtree as pre' },
  { line: 6, text: 'attach the old right subtree to pre.right' },
  { line: 7, text: 'move the left subtree to cur.right' },
  { line: 8, text: 'clear cur.left' },
  { line: 9, text: 'cur = cur.right' },
  { line: 10, text: 'return the right chain values in order' },
]
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def flatten_tree(root):
    n = len(root)
    if n == 0 or root[0] is None:
        return []
    left = [None] * n
    right = [None] * n
    queue = [0]
    nxt = 1
    head = 0
    while head < len(queue):
        i = queue[head]
        head += 1
        for side in ("left", "right"):
            slot = nxt
            nxt += 1
            if slot < n and root[slot] is not None:
                if side == "left":
                    left[i] = slot
                else:
                    right[i] = slot
                queue.append(slot)
    cur = 0
    while cur is not None:
        if left[cur] is not None:
            pre = left[cur]
            while right[pre] is not None:
                pre = right[pre]
            right[pre] = right[cur]
            right[cur] = left[cur]
            left[cur] = None
        cur = right[cur]
    result = []
    cur = 0
    while cur is not None:
        result.append(root[cur])
        cur = right[cur]
    return result
`
