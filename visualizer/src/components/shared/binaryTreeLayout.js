// Inorder spacing keeps every node readable, including sparse and deep trees.
// Iterative traversal avoids consuming the JavaScript call stack.
export function binaryTreeLayout(root, { columnGap = 76, levelGap = 86, padding = 48 } = {}) {
  const positions = new Map(), nodes = [], edges = [], stack = [];
  let node = root, depth = 0, column = 0, maxDepth = 0;
  while (node || stack.length) {
    while (node) {
      stack.push({ node, depth });
      node = node.left;
      depth++;
    }
    const current = stack.pop();
    node = current.node;
    depth = current.depth;
    positions.set(node.id, { x: padding + column++ * columnGap, y: padding + depth * levelGap });
    maxDepth = Math.max(maxDepth, depth);
    nodes.push(node);
    for (const child of [node.left, node.right]) if (child) edges.push({ fromId: node.id, toId: child.id });
    node = node.right;
    depth++;
  }
  return { positions, nodes, edges, width: Math.max(320, padding * 2 + Math.max(0, column - 1) * columnGap), height: Math.max(240, padding * 2 + maxDepth * levelGap) };
}
