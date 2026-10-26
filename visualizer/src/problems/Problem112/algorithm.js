export function parsePathSum(rootText, targetText) {
  const values = JSON.parse(rootText);
  if (!Array.isArray(values) || values.some(value => value !== null && !Number.isSafeInteger(value))) {
    throw new Error('Use a level-order array of integers and nulls.');
  }
  const target = Number(targetText);
  if (String(targetText).trim() === '' || !Number.isSafeInteger(target)) throw new Error('Target must be an integer.');
  return { values, target };
}

export function buildPathSum(values, target) {
  const nodes = [];
  if (values.length && values[0] !== null) {
    nodes.push({ id: 0, value: values[0], parent: null, depth: 0, left: null, right: null, visitAt: Infinity });
    let cursor = 1;
    for (let head = 0; head < nodes.length && cursor < values.length; head++) {
      for (const side of ['left', 'right']) {
        if (cursor >= values.length) break;
        const value = values[cursor++];
        if (value === null) continue;
        const id = nodes.length;
        nodes[head][side] = id;
        nodes.push({ id, value, parent: head, depth: nodes[head].depth + 1, left: null, right: null, visitAt: Infinity });
      }
    }
    if (values.slice(cursor).some(value => value !== null)) throw new Error('Some values have no parent. Check the level-order input.');
  } else if (values.slice(1).some(value => value !== null)) {
    throw new Error('An empty root cannot have children.');
  }
  // Inorder positions keep left and right children visually distinct, even
  // when several nodes have the same value. IDs never depend on node values.
  const layoutStack = [];
  let current = nodes.length ? 0 : null;
  let column = 0;
  while (current !== null || layoutStack.length) {
    while (current !== null) { layoutStack.push(current); current = nodes[current].left; }
    current = layoutStack.pop();
    nodes[current].x = 40 + column++ * 64;
    nodes[current].y = 40 + nodes[current].depth * 90;
    current = nodes[current].right;
  }
  const frames = [{ phase: 'init', activeLine: 1, nodeId: null, sum: 0, message: `Find a root-to-leaf route totaling ${target}.` }];
  const stack = nodes.length ? [{ id: 0, sum: 0, exit: false }] : [];
  let result = false;
  let winningId = null;
  while (stack.length) {
    const work = stack.pop();
    const node = nodes[work.id];
    if (work.exit) {
      frames.push({ phase: 'backtrack', activeLine: 7, nodeId: node.parent, fromId: node.id,
        sum: work.sum, message: `No matching leaf below ${node.value}. Return to its parent and try another branch.` });
      continue;
    }
    const sum = work.sum + node.value;
    node.visitAt = frames.length;
    frames.push({ phase: 'visit', activeLine: 3, nodeId: node.id, sum,
      message: `Visit ${node.value}: route total ${sum}; remaining target ${target - sum}.` });
    const leaf = node.left === null && node.right === null;
    if (leaf) {
      const matches = sum === target;
      frames.push({ phase: matches ? 'found' : 'reject', activeLine: 4, nodeId: node.id, sum,
        message: matches ? `Leaf reached with total ${target}. This route is a solution.` : `Leaf reached with total ${sum}, not ${target}. Backtrack.` });
      if (matches) { result = true; winningId = node.id; break; }
    } else {
      frames.push({ phase: 'descend', activeLine: 5, nodeId: node.id, sum,
        message: sum === target ? 'The total matches, but this is not a leaf. Continue: a valid route must end at a leaf.'
          : `Carry ${target - sum} into the children. Negative values can change the total, so do not prune by sum.` });
    }
    stack.push({ id: node.id, sum: work.sum, exit: true });
    if (node.right !== null) stack.push({ id: node.right, sum, exit: false });
    if (node.left !== null) stack.push({ id: node.left, sum, exit: false });
  }
  frames.push({ phase: 'done', activeLine: nodes.length ? (result ? 4 : 7) : 2,
    nodeId: winningId, sum: result ? target : 0, result,
    message: result ? 'Return True. Stop exploring: the left-or-right search already found a route.' : 'Return False. No root-to-leaf route reaches the target.' });
  return { nodes, frames, target, result, width: Math.max(280, nodes.length * 64 + 16), height: Math.max(160, ...nodes.map(node => node.y + 45)) };
}

export function getRoute(nodes, nodeId) {
  const route = [];
  for (let id = nodeId; id !== null && id !== undefined; id = nodes[id].parent) route.push(nodes[id]);
  return route.reverse();
}
