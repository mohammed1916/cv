import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveVisualSelection } from './visualSelection.js';

// DOM-shaped fixtures isolate event routing from layout and React rendering.
function fixture({ marked = null, blocked = false, control = false, group = null } = {}) {
  return { closest(selector) {
    if (selector.includes('[data-chat-ignore]')) return blocked ? {} : null;
    if (selector === '[data-chat-selectable]') return marked;
    if (selector.startsWith('button')) return control ? {} : null;
    return group;
  } };
}
function element(tag, text, attributes = {}, title = '') {
  return { tagName: tag, textContent: text, getAttribute: name => attributes[name] ?? null, querySelector: () => title ? { textContent: title } : null };
}
test('grid data buttons attach the whole cell with coordinates; ordinary buttons remain controls', () => {
  const cell = element('BUTTON', '[2, 3] 7 current', { 'aria-label': 'Cell 2, 3: 7', 'data-row': '2', 'data-column': '3' });
  const picked = resolveVisualSelection(fixture({ marked: cell, control: true }));
  assert.equal(picked.label, 'Selected: Cell 2, 3: 7');
  assert.equal(picked.data.row, '2');
  assert.equal(picked.data.text, '[2, 3] 7 current');
  assert.equal(resolveVisualSelection(fixture({ control: true })), null);
});
test('SVG shape clicks attach the enclosing node title and text', () => {
  const node = element('g', 'root 12', {}, 'root: sum 12');
  assert.equal(resolveVisualSelection(fixture({ group: node })).label, 'Selected: root: sum 12');
});
test('code, chat controls, and Selectable wrappers retain their own handlers', () => {
  assert.equal(resolveVisualSelection(fixture({ blocked: true, marked: element('DIV', 'ignored') })), null);
  assert.equal(resolveVisualSelection(null), null);
});
