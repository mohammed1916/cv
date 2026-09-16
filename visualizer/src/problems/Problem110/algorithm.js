export function parseBalancedTree(text) {
  const values = JSON.parse(text);
  if (!Array.isArray(values) || values.some(v => v !== null && !Number.isSafeInteger(v))) throw new Error('Use a level-order array of integers and nulls.');
  const nodes = values.length && values[0] !== null ? [{ id: 0, val: values[0], left: null, right: null }] : [];
  let cursor = 1;
  for (let head = 0; head < nodes.length && cursor < values.length; head++) {
    for (const side of ['left', 'right']) {
      if (cursor >= values.length) break;
      const val = values[cursor++];
      if (val === null) continue;
      const node = { id: nodes.length, val, left: null, right: null };
      nodes[head][side] = node;
      nodes.push(node);
    }
  }
  if (values.slice(cursor).some(v => v !== null)) throw new Error('Some values have no parent. Check the level-order array.');
  return nodes[0] ?? null;
}

export function traceBalance(root) {
  const frames = [], heights = new Map(), unbalancedIds = new Set();
  let firstFailure = null;
  const emit = (node, phase, activeLine, message, extra = {}) => frames.push({
    activeId: node?.id ?? -1, phase, activeLine, message,
    heights: new Map(heights), unbalancedIds: new Set(unbalancedIds), firstFailure, result: null, ...extra,
  });
  const stack = root ? [{ node: root, stage: 0 }] : [];
  const returned = new Map();
  while (stack.length) {
    const work = stack.at(-1), node = work.node;
    if (work.stage === 0) {
      emit(node, 'recurse-left', 4, `Node ${node.val}: ask the left subtree for its height. Missing children return 0.`);
      work.stage = 1;
      if (node.left) stack.push({ node: node.left, stage: 0 });
      continue;
    }
    const left = node.left ? returned.get(node.left.id) : 0;
    if (work.stage === 1 && left !== -1) {
      emit(node, 'recurse-right', 6, `Left height ${left}. Now measure the right subtree.`, { left });
      work.stage = 2;
      if (node.right) stack.push({ node: node.right, stage: 0 });
      continue;
    }
    const right = work.stage === 2 ? (node.right ? returned.get(node.right.id) : 0) : null;
    if (left === -1 || right === -1) {
      unbalancedIds.add(node.id);
      returned.set(node.id, -1);
      emit(node, 'propagate', left === -1 ? 5 : 7,
        `Child subtree already failed. Return -1${left === -1 ? '; skip the right subtree' : ''}. This is not a new height comparison.`, { left, right });
    } else {
      const difference = Math.abs(left - right);
      emit(node, 'compare', 8, `Compare child heights: |${left} - ${right}| = ${difference}. Allowed difference: at most 1.`, { left, right, difference });
      if (difference > 1) {
        firstFailure ??= node.id;
        unbalancedIds.add(node.id);
        returned.set(node.id, -1);
        emit(node, 'unbalanced', 8, `First imbalance at node ${node.val}: difference ${difference} exceeds 1. Return -1.`, { left, right, difference });
      } else {
        const height = Math.max(left, right) + 1;
        heights.set(node.id, height);
        returned.set(node.id, height);
        emit(node, 'balanced', 9, `Return height ${height} = max(${left}, ${right}) + 1 to the parent.`, { left, right, difference });
      }
    }
    stack.pop();
  }
  const result = !root || returned.get(root.id) !== -1;
  emit(null, 'done', 10, result ? 'Every subtree is balanced.' : 'An unbalanced subtree makes the whole tree unbalanced.', { result });
  return frames;
}
