export function parseMinimumDepth(text) {
  const values = JSON.parse(text);
  if (!Array.isArray(values) || values.some(value => value !== null && !Number.isSafeInteger(value))) {
    throw new Error('Use a level-order array of integers and nulls.');
  }
  return values;
}

export function buildMinimumDepth(values) {
  const nodes = [];
  if (values.length && values[0] !== null) {
    nodes.push({ id: 0, val: values[0], parent: null, depth: 1, left: null, right: null });
    let cursor = 1;
    for (let head = 0; head < nodes.length && cursor < values.length; head++) {
      for (const side of ['left', 'right']) {
        if (cursor >= values.length) break;
        const val = values[cursor++];
        if (val === null) continue;
        nodes[head][side] = nodes.length;
        nodes.push({ id: nodes.length, val, parent: head, depth: nodes[head].depth + 1, left: null, right: null });
      }
    }
    if (values.slice(cursor).some(value => value !== null)) throw new Error('Some values have no parent. Check the level-order array.');
  } else if (values.slice(1).some(value => value !== null)) throw new Error('An empty root cannot have children.');
  const positions = [];
  const layout = [];
  let id = nodes.length ? 0 : null;
  let column = 0;
  while (id !== null || layout.length) {
    while (id !== null) { layout.push(id); id = nodes[id].left; }
    id = layout.pop();
    positions[id] = { x: 100 + column++ * 90, y: nodes[id].depth * 100 - 40 };
    id = nodes[id].right;
  }
  const frames = [];
  let bestLeaf = null;
  let minDepth = Infinity;
  const emit = (nodeId, phase, activeLine, message, extra = {}) => frames.push({ nodeId, phase, activeLine, message, bestLeaf, minDepth, ...extra });
  emit(null, 'init', 1, 'Depth counts nodes, including the root. Only a node with no children ends a route.');
  const stack = nodes.length ? [{ id: 0, returning: false }] : [];
  while (stack.length) {
    const work = stack.pop();
    const node = nodes[work.id];
    if (work.returning) {
      const left = node.left === null ? null : nodes[node.left].returnedDepth;
      const right = node.right === null ? null : nodes[node.right].returnedDepth;
      node.returnedDepth = 1 + (left === null ? right : right === null ? left : Math.min(left, right));
      node.returnAt = frames.length;
      emit(node.id, 'return', left === null ? 10 : right === null ? 12 : 14,
        left === null || right === null ? `Only one real child: 1 + ${left ?? right} = ${node.returnedDepth}. The missing side is not a route.`
          : `Compare complete child routes: 1 + min(${left}, ${right}) = ${node.returnedDepth}.`, { returnedDepth: node.returnedDepth });
      continue;
    }
    node.visitAt = frames.length;
    emit(node.id, 'visit', 6, `Visit ${node.val} at depth ${node.depth}. Does it have any children?`);
    if (node.left === null && node.right === null) {
      node.leafAt = frames.length;
      node.returnAt = frames.length;
      node.returnedDepth = 1;
      if (node.depth < minDepth) { minDepth = node.depth; bestLeaf = node.id; }
      emit(node.id, 'leaf', 7, `A real leaf: this route contains ${node.depth} nodes. Return subtree depth 1.`, { returnedDepth: 1 });
      continue;
    }
    stack.push({ id: node.id, returning: true });
    if (node.left === null || node.right === null) {
      emit(node.id, 'missing_child', node.left === null ? 9 : 11,
        `The ${node.left === null ? 'left' : 'right'} child is missing. Do not choose depth 0: follow the existing child.`,
        { missingSide: node.left === null ? 'left' : 'right' });
    } else emit(node.id, 'compare', 14, 'Explore both children, then compare their returned depths.');
    if (node.right !== null) stack.push({ id: node.right, returning: false });
    if (node.left !== null) stack.push({ id: node.left, returning: false });
  }
  const result = nodes.length ? nodes[0].returnedDepth : 0;
  emit(bestLeaf, 'done', nodes.length ? (nodes[0].left === null ? 10 : nodes[0].right === null ? 12 : nodes.length === 1 ? 7 : 14) : 4,
    nodes.length ? `Shortest root-to-leaf route: ${result} node${result === 1 ? '' : 's'}. Missing children were never counted as leaves.` : 'The entire tree is empty. Return 0.', { minDepth: result, result });
  // A single root is itself a leaf, independent of the one-child cases.
  if (nodes.length === 1) frames.at(-1).activeLine = 7;
  return { nodes, positions, frames, result, width: Math.max(320, nodes.length * 90 + 100), height: Math.max(180, ...nodes.map(node => node.depth * 100 + 20)) };
}

export function routeTo(nodes, leaf) {
  const route = [];
  for (let id = leaf; id !== null && id !== undefined; id = nodes[id].parent) route.push(nodes[id]);
  return route.reverse();
}
