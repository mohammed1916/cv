export function parseSortedList(text) {
  const values = JSON.parse(text);
  if (!Array.isArray(values) || values.some(v => !Number.isSafeInteger(v))) throw new Error('Use an array of integers.');
  if (values.some((v, i) => i > 0 && v < values[i - 1])) throw new Error('The list must be sorted in ascending order.');
  if (values.length > 200) throw new Error('This interactive story supports up to 200 nodes.');
  return values;
}

export function buildSortedTreeStory(values, sourceKind = 'list') {
  const frames = [], nodes = [];
  const emit = (phase, activeLine, message, extra = {}) => {
    frames.push({ phase, activeLine, message, copied: values.length, lo: 0, hi: values.length, ...extra });
    return frames.length - 1;
  };
  if (sourceKind === 'list') {
    emit('init', 9, 'Read the linked list in order before choosing subtree roots.', { copied: 0 });
    values.forEach((value, index) => emit('visit', 12, `Copy list node #${index}: ${value}.`, { copied: index + 1, cursor: index }));
  } else emit('init', 9, 'Use the sorted array directly. Choose a midpoint for each interval.');
  function build(lo, hi, parent = null, side = null, depth = 0) {
    if (lo === hi) { emit('return', 3, 'Empty interval: attach no child.', { lo, hi, parent, side }); return null; }
    const mid = lo + Math.floor((hi - lo) / 2);
    emit('compare', 4, `Choose index ${mid}. Left has ${mid - lo} values; right has ${hi - mid - 1}.`, { lo, hi, mid, parent, side });
    const node = { id: mid, val: values[mid], depth, parent, left: null, right: null };
    node.createdAt = emit('update', 5, `Create node #${mid}${parent === null ? ' as the root' : ` as the ${side} child of #${parent}`}.`, { lo, hi, mid, parent, side });
    nodes.push(node);
    emit('visit', 6, 'Build the left interval; these values precede the root in sorted order.', { lo, hi: mid, mid, parent: mid, side: 'left' });
    node.left = build(lo, mid, mid, 'left', depth + 1);
    emit('visit', 7, 'Build the right interval; these values follow the root in sorted order.', { lo: mid + 1, hi, mid, parent: mid, side: 'right' });
    node.right = build(mid + 1, hi, mid, 'right', depth + 1);
    node.height = 1 + Math.max(node.left?.height ?? 0, node.right?.height ?? 0);
    node.returnedAt = emit('return', 8, `Subtree #${mid} is complete: child heights ${node.left?.height ?? 0} and ${node.right?.height ?? 0}. Return it to the parent.`, { lo, hi, mid });
    return node;
  }
  const root = build(0, values.length);
  emit('done', sourceKind === 'list' ? 14 : 9, values.length ? 'Complete: inorder traversal reproduces the input, and every subtree has balanced heights.' : 'Empty list produces an empty tree.');
  return { root, nodes, frames };
}
