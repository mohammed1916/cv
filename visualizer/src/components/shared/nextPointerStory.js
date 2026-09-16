import { parseLevelOrderTree } from './levelOrderTree.js';
import { binaryTreeLayout } from './binaryTreeLayout.js';

export const NEXT_POINTER_CODE = {
  perfect: [
    'def connect(root):', '    if not root: return root', '    leftmost = root',
    '    while leftmost.left:', '        current = leftmost', '        while current:',
    '            current.left.next = current.right',
    '            if current.next:', '                current.right.next = current.next.left',
    '            current = current.next', '        leftmost = leftmost.left', '    return root',
  ],
  sparse: [
    'def connect(root):', '    current = root', '    while current:',
    '        dummy = Node(0); tail = dummy', '        while current:',
    '            for child in (current.left, current.right):', '                if child:',
    '                    tail.next = child', '                    tail = child',
    '            current = current.next', '        current = dummy.next', '    return root',
  ],
};

export function buildNextPointerStory(text, mode) {
  const root = parseLevelOrderTree(text), layout = binaryTreeLayout(root);
  if (layout.nodes.length > 200) throw new Error('Use at most 200 nodes for the pointer trace.');
  if (mode === 'perfect') {
    const leafDepths = new Set();
    for (const node of layout.nodes) {
      if (Boolean(node.left) !== Boolean(node.right)) throw new Error('Problem 116 requires a perfect tree: every internal node has two children.');
      if (!node.left) leafDepths.add(layout.positions.get(node.id).y);
    }
    if (leafDepths.size > 1) throw new Error('Problem 116 requires all leaves at the same depth. Try Problem 117 for a sparse tree.');
  }
  const byId = new Map(layout.nodes.map(n => [n.id,n]));
  const next = Object.fromEntries(layout.nodes.map(n => [n.id,null]));
  const frames = [];
  let current = root, tail = null, head = null, level = 0;
  const snap = (activeLine, phase, message, changed = null) => frames.push({
    activeLine, phase, message, changed, currentId: current?.id ?? null,
    tailId: tail?.id ?? null, headId: head?.id ?? null, level, next: { ...next },
  });
  const successor = node => byId.get(next[node.id]) ?? null;
  snap(2, 'init', root ? 'All next pointers start at null.' : 'Empty tree: return null.');
  if (mode === 'perfect') {
    let leftmost = root;
    while (leftmost?.left) {
      head = leftmost; current = leftmost;
      snap(5, 'level', 'Walk the connected parent row to wire the row below.');
      while (current) {
        next[current.left.id] = current.right.id;
        snap(7, 'sibling', 'Connect the two children of this parent.', { from: current.left.id, to: current.right.id });
        if (successor(current)) {
          next[current.right.id] = successor(current).left.id;
          snap(9, 'bridge', 'Bridge between parents: right child points to the next parent’s left child.', { from: current.right.id, to: successor(current).left.id });
        }
        current = successor(current);
        snap(10, 'advance', 'Follow the existing parent next pointer.');
      }
      leftmost = leftmost.left; head = leftmost; level++;
      snap(11, 'level', 'Descend to the first node of the newly connected row.');
    }
  } else {
    while (current) {
      head = null; tail = null;
      snap(4, 'level', 'Start a fresh dummy head for the next row. Only real children will be appended.');
      while (current) {
        for (const child of [current.left,current.right]) {
          if (!child) { snap(7, 'skip', 'Missing child: append nothing, preserving the order of real children.'); continue; }
          const from = tail?.id ?? null;
          if (tail) next[tail.id] = child.id;
          else head = child;
          snap(8, 'append', from === null ? 'Dummy.next now points to the first real child of the next row.' : 'Append this child after the previous real child, bridging any missing positions.', { from, to: child.id });
          tail = child;
          snap(9, 'advance', 'Move tail to the appended child. Its next pointer is still null.');
        }
        current = successor(current);
        snap(10, 'advance', 'Follow the current row’s existing next pointer.');
      }
      current = head; level++;
      snap(11, 'level', current ? 'Use dummy.next to enter the row just built.' : 'The next row is empty. All levels are connected.');
    }
  }
  current = null;
  snap(12, 'done', 'Every next pointer leads to the immediate neighbor at the same depth; each row ends at null.');
  return { ...layout, mode, frames };
}
