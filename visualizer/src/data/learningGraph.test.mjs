import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, access } from 'node:fs/promises';
import { LEARNING_CONCEPTS, LEARNING_TOPICS, CONCEPT_BY_ID, LEARNING_SOURCES, conceptPath, searchLearningCatalog } from './learningTaxonomy.js';
import { VISUALIZER_CAPABILITIES, prerequisitePath, buildLearningIndex } from './learningGraph.js';

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

test('concepts have one canonical ID/title and one acyclic home', () => {
  assert.equal(new Set(LEARNING_CONCEPTS.map(item => item.id)).size, LEARNING_CONCEPTS.length);
  assert.equal(new Set(LEARNING_CONCEPTS.map(item => item.title.toLowerCase())).size, LEARNING_CONCEPTS.length);
  const rootIds = new Set(LEARNING_TOPICS.map(item => item.id));
  for (const item of LEARNING_CONCEPTS) {
    const visited = new Set();
    let current = item;
    while (current) {
      assert.ok(!visited.has(current.id), `Hierarchy cycle at ${current.id}`);
      visited.add(current.id);
      if (current.parent) assert.ok(CONCEPT_BY_ID[current.parent], `Missing home for ${current.id}`);
      current = CONCEPT_BY_ID[current.parent];
    }
    assert.ok(rootIds.has(conceptPath(item.id)[0]));
    if (item.source) assert.ok(LEARNING_SOURCES[item.source]);
  }
  assert.deepEqual(conceptPath('prefix-sums'), ['arrays', 'prefix-sums']);
  assert.ok(!rootIds.has('prefix-sums'));
  assert.deepEqual(conceptPath('knapsack-bounded'), ['dp', 'knapsack', 'knapsack-bounded']);
});

test('prerequisites and cross-links resolve independently of containment', () => {
  for (const item of LEARNING_CONCEPTS) {
    for (const id of [...item.requires, ...item.related]) {
      assert.ok(CONCEPT_BY_ID[id], `${item.id}: missing relation ${id}`);
      assert.notEqual(item.id, id);
    }
    assert.doesNotThrow(() => prerequisitePath(item.id));
  }
  assert.deepEqual(prerequisitePath('bfs'), ['queue', 'graphs']);
  assert.ok(!prerequisitePath('bfs').includes('recursion'));
  assert.ok(CONCEPT_BY_ID.strings.related.includes('sliding-window'));
  assert.ok(CONCEPT_BY_ID['alpha-beta'].requires.includes('minimax'));
});

test('all curated examples resolve to implemented routes', () => {
  for (const item of LEARNING_CONCEPTS) {
    for (const number of item.picks) assert.ok(index.byNumber.has(number), `${item.id}: missing ${number}`);
  }
});

test('children roll up without duplicate problems and ungrouped entries preserve coverage', () => {
  for (const item of LEARNING_CONCEPTS) {
    const entry = index.byConcept[item.id];
    const children = new Set(entry.children.flatMap(child => index.byConcept[child.id].problems));
    assert.deepEqual(new Set([...children, ...entry.ungrouped]), new Set(entry.problems));
    assert.ok(entry.ungrouped.every(problem => !children.has(problem)));
    assert.equal(new Set(entry.problems.map(problem => String(problem.number))).size, entry.problems.length);
    assert.ok(entry.problems.every(problem => problem.implemented));
    assert.deepEqual(entry.problems.slice(0, entry.recommended.length), entry.recommended);
    for (const problem of entry.problems) {
      assert.ok(index.byProblem[problem.number].concepts.includes(item.id));
      if (item.parent) assert.ok(index.byConcept[item.parent].problems.includes(problem));
    }
  }
});

test('algorithm variants stay separate and unsupported techniques do not borrow visualizers', () => {
  assert.ok(index.byConcept['knapsack-01'].problems.some(problem => problem.number === '416'));
  assert.ok(!index.byConcept['knapsack-01'].problems.some(problem => problem.number === '322'));
  assert.ok(index.byConcept['knapsack-unbounded'].problems.some(problem => problem.number === '322'));
  for (const id of ['alpha-beta', 'knapsack-bounded', 'knapsack-mixed', 'dsu-rollback']) {
    assert.equal(index.byConcept[id].problems.length, 0);
    assert.equal(index.byConcept[id].capabilities.length, 0);
  }
  assert.ok(index.byProblem['51'].concepts.includes('constraints'));
  assert.ok(!index.byProblem['51'].concepts.includes('dp'));
});

test('visual features only link to actual indexed examples', async () => {
  for (const feature of VISUALIZER_CAPABILITIES) {
    await access(new URL(`../../${feature.source}`, import.meta.url));
    for (const number of feature.problems) {
      assert.ok(index.byNumber.has(number));
      assert.ok(index.byProblem[number].capabilities.includes(feature.id));
    }
  }
  for (const entry of Object.values(index.byConcept)) {
    for (const feature of entry.capabilities) {
      for (const number of feature.problems) assert.ok(entry.problems.some(problem => String(problem.number) === number));
    }
  }
});

test('tag aliases and unavailable routes are handled consistently', () => {
  const fixture = buildLearningIndex([
    { number: 'a', implemented: true, tags: ['DP'] },
    { number: 'b', implemented: true, tags: ['Heap (Priority Queue)'] },
    { number: 'c', implemented: true, tags: ['Union-Find'] },
    { number: 'd', implemented: false, tags: ['DP'] },
  ]);
  assert.deepEqual(fixture.byConcept.dp.problems.map(problem => problem.number), ['a']);
  assert.deepEqual(fixture.byConcept.heaps.problems.map(problem => problem.number), ['b']);
  assert.deepEqual(fixture.byConcept['union-find'].problems.map(problem => problem.number), ['c']);
  assert.equal(fixture.byConcept['alpha-beta'].problems.length, 0);
});

test('deep search returns canonical entries, including concept-only lessons', () => {
  assert.ok(searchLearningCatalog('prefix sums').some(item => item.id === 'prefix-sums'));
  assert.ok(searchLearningCatalog('knapsack bounded').some(item => item.id === 'knapsack-bounded'));
  assert.ok(searchLearningCatalog('alpha-beta').some(item => item.id === 'alpha-beta'));
  assert.ok(searchLearningCatalog('simulation').some(item => item.id === 'robot-simulation'));
  assert.equal(searchLearningCatalog('not-a-concept').length, 0);
  for (const query of ['prefix', 'knapsack', 'bits', 'graph']) {
    const results = searchLearningCatalog(query);
    assert.equal(new Set(results.map(item => item.id)).size, results.length);
  }
});
