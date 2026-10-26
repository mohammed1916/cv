export function parseLevelOrderTree(text, prefix = null) {
  const values = JSON.parse(text);
  if (!Array.isArray(values) || values.some(v => v !== null && !Number.isSafeInteger(v))) throw new Error('Use a level-order array of integers and nulls.');
  const nodes = values.length && values[0] !== null ? [{ id: prefix === null ? 0 : `${prefix}-0`, val: values[0], left: null, right: null }] : [];
  let cursor = 1;
  for (let head = 0; head < nodes.length && cursor < values.length; head++) {
    for (const side of ['left', 'right']) {
      if (cursor >= values.length) break;
      const val = values[cursor++];
      if (val === null) continue;
      const node = { id: prefix === null ? nodes.length : `${prefix}-${nodes.length}`, val, left: null, right: null };
      nodes[head][side] = node;
      nodes.push(node);
    }
  }
  if (values.slice(cursor).some(v => v !== null)) throw new Error('Some values have no parent. Check the level-order array.');
  return nodes[0] ?? null;
}
