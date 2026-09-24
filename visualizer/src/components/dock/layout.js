export function ids(node) {
  return !node ? [] : node.type === 'tabs' ? node.tabs : [...ids(node.first), ...ids(node.second)];
}
let sequence = 0;
export function group(id) { return { type: 'tabs', key: `group:${id}:${++sequence}`, tabs: [id], active: id }; }
export function update(node, key, change) {
  if (!node) return node;
  if (node.key === key) return change(node);
  return node.type === 'split' ? { ...node, first: update(node.first, key, change), second: update(node.second, key, change) } : node;
}
export function remove(node, id) {
  if (!node) return null;
  if (node.type === 'tabs') {
    const tabs = node.tabs.filter(value => value !== id);
    return tabs.length ? { ...node, tabs, active: tabs.includes(node.active) ? node.active : tabs[0] } : null;
  }
  const first = remove(node.first, id), second = remove(node.second, id);
  return first && second ? { ...node, first, second } : first || second;
}
export function findGroup(node, id) {
  if (!node) return null;
  return node.type === 'tabs' ? (node.tabs.includes(id) ? node : null) : findGroup(node.first, id) || findGroup(node.second, id);
}
export function insert(node, id, target, side = 'right', fraction = .5) {
  if (!node) return group(id);
  const destination = target ? findGroup(node, target) : node;
  if (!destination) return insert(node, id, null, side, fraction);
  return update(node, destination.key, current => {
    if (side === 'tab' && current.type === 'tabs') return { ...current, tabs: [...current.tabs, id], active: id };
    const before = side === 'left' || side === 'top';
    const ratio = Math.max(.1, Math.min(.9, Number.isFinite(fraction) ? fraction : .5));
    return { type: 'split', key: `split:${id}:${++sequence}`, axis: side === 'top' || side === 'bottom' ? 'vertical' : 'horizontal',
      ratio: before ? ratio : 1 - ratio, first: before ? group(id) : current, second: before ? current : group(id) };
  });
}
export function move(node, id, target, side) {
  if (id === target) return node;
  return insert(remove(node, id), id, target, side);
}
// Project hidden panels out of the layout without changing the stored split tree.
export function visible(node, hidden) {
  if (!node) return null;
  if (node.type === 'tabs') {
    const tabs = node.tabs.filter(id => !hidden.has(id));
    return tabs.length ? { ...node, tabs, active: tabs.includes(node.active) ? node.active : tabs[0] } : null;
  }
  const first = visible(node.first, hidden), second = visible(node.second, hidden);
  return first && second ? { ...node, first, second } : first || second;
}
export function createLayout(panels) {
  let tree = null, previous = null;
  for (const panel of panels) {
    const side = panel.dockMode?.startsWith('tab') ? 'tab' : panel.dockMode?.replace('split-', '') || 'right';
    // Code belongs beside the complete visual workspace, including its input area.
    const target = panel.ref || (panel.id === 'code' && side !== 'tab' ? null : previous);
    const compactTarget = panels.find(item => item.id === target)?.size === 'compact';
    tree = insert(tree, panel.id, target, side, panel.ratio ?? (panel.size === 'compact' ? .22 : compactTarget && side === 'bottom' ? .78 : .5));
    previous = panel.id;
  }
  return tree;
}
