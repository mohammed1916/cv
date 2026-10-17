import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, access } from 'node:fs/promises';
import { LEARNING_TOPICS, TOPIC_BY_ID, VISUALIZER_CAPABILITIES, prerequisitePath, buildLearningIndex } from './learningGraph.js';

const folders = await readdir(new URL('../problems/', import.meta.url), { withFileTypes: true });
const problems = [];
for (const folder of folders.filter(item => item.isDirectory())) {
  const base = new URL(`../problems/${folder.name}/`, import.meta.url);
  try { await access(new URL('meta.js', base)); } catch { continue; }
  const { meta } = await import(new URL('meta.js', base));
  if (!meta) continue;
  let implemented = true;
  try { await access(new URL('index.jsx', base)); } catch { implemented = false; }
  problems.push({ ...meta, implemented });
}
const index = buildLearningIndex(problems);

test('prerequisites form an acyclic graph and every recommendation opens an implemented route', () => {
  assert.equal(new Set(LEARNING_TOPICS.map(topic => topic.id)).size, LEARNING_TOPICS.length);
  function visit(id, path = []) {
    assert.ok(TOPIC_BY_ID[id], `Unknown topic ${id}`);
    assert.ok(!path.includes(id), `Cycle: ${[...path, id].join(' -> ')}`);
    for (const parent of TOPIC_BY_ID[id].requires) visit(parent, [...path, id]);
  }
  for (const topic of LEARNING_TOPICS) {
    visit(topic.id);
    for (const number of topic.picks) assert.ok(index.byNumber.has(number), `${topic.id}: missing ${number}`);
    for (const id of topic.related || []) assert.ok(TOPIC_BY_ID[id]);
  }
});

test('BFS requires queues; recursion is related, and N-Queens is not classified as DP', () => {
  assert.deepEqual(prerequisitePath('bfs'), ['queue', 'graphs']);
  assert.ok(TOPIC_BY_ID.bfs.related.includes('recursion'));
  assert.ok(index.byProblem['51'].topics.includes('backtracking'));
  assert.ok(!index.byProblem['51'].topics.includes('dp'));
  const path = prerequisitePath('constraints');
  assert.ok(path.indexOf('stack') < path.indexOf('recursion'));
  assert.ok(path.indexOf('recursion') < path.indexOf('backtracking'));
});

test('visual capabilities have real sources, valid topics, and implemented examples', async () => {
  for (const feature of VISUALIZER_CAPABILITIES) {
    await access(new URL(`../../${feature.source}`, import.meta.url));
    for (const id of feature.topics) assert.ok(TOPIC_BY_ID[id]);
    for (const number of feature.problems) {
      assert.ok(index.byNumber.has(number), `${feature.id}: missing ${number}`);
      assert.ok(index.byProblem[number].capabilities.includes(feature.id));
      for (const id of feature.topics) assert.ok(index.byProblem[number].topics.includes(id));
    }
  }
});

test('index removes unavailable routes and deduplicates recommended/tagged/featured matches', () => {
  for (const entry of Object.values(index.byTopic)) {
    assert.equal(new Set(entry.problems.map(problem => problem.number)).size, entry.problems.length);
    assert.ok(entry.problems.every(problem => problem.implemented));
    assert.deepEqual(entry.problems.slice(0, entry.recommended.length), entry.recommended);
  }
  const empty = buildLearningIndex([{ number: '51', implemented: false, tags: ['Backtracking'] }]);
  assert.equal(empty.byTopic.backtracking.problems.length, 0);
  assert.equal(empty.byTopic.backtracking.capabilities.length, 0);
});
