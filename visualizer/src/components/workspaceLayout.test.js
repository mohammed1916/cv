import test from 'node:test';
import assert from 'node:assert/strict';
import { createFocusedLayout } from './workspaceLayout.js';
const flatten = area => area.type === 'tab-area' ? area.widgets : area.children.flatMap(flatten);
test('problem layout groups secondary views and retains every widget instance', () => {
  const widgets = ['array', 'hashmap', 'code', 'inputs'].map(id => ({ id }));
  const layout = createFocusedLayout(widgets);
  assert.equal(layout.main.orientation, 'horizontal');
  assert.deepEqual(layout.main.children[0].widgets, [widgets[0], widgets[1], widgets[3]]);
  assert.equal(layout.main.children[1].widgets[0], widgets[2]);
  assert.equal(new Set(flatten(layout.main)).size, widgets.length);
});
test('playground keeps playback visible and configuration next to code', () => {
  const widgets = ['editor', 'preview', 'configuration', 'timeline'].map(id => ({ id }));
  const layout = createFocusedLayout(widgets);
  assert.equal(layout.main.orientation, 'vertical');
  assert.equal(layout.main.children[1].widgets[0], widgets[3]);
  assert.deepEqual(layout.main.children[0].children[1].widgets, [widgets[0], widgets[2]]);
  assert.equal(new Set(flatten(layout.main)).size, widgets.length);
});
test('workspaces without a code and visual pair retain their original layout', () => {
  assert.equal(createFocusedLayout([{ id: 'array' }]), null);
  assert.equal(createFocusedLayout([{ id: 'code' }]), null);
});
