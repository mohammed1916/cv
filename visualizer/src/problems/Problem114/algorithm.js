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
