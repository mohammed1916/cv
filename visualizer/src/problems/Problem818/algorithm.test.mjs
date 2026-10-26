import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
function bfs(target) {
  const seen = new Set(['0,1']); let level = [[0, 1]]; let steps = 0
  while (level.length) {
    const next = []
    for (const [p, s] of level) {
      if (p === target) return steps
      for (const st of [[p + s, s * 2], [p, s > 0 ? -1 : 1]]) {
        if (Math.abs(st[0]) > 2 * target + 2) continue
        const key = st.join(','); if (!seen.has(key)) { seen.add(key); next.push(st) }
      }
    }
    level = next; steps++
  }
}
test('examples', () => {
  assert.equal(buildTrace(parseInput('3')).result, 2)
  assert.equal(buildTrace(parseInput('6')).result, 5)
})
test('matches BFS over (position, speed) states', () => {
  const run = buildTrace(300)
  for (let t = 1; t <= 300; t++) assert.equal(run.dp[t], bfs(t), `target ${t}`)
  assert.equal(run.frames[0].phase, 'start'); assert.equal(run.frames.at(-1).phase, 'done')
})
test('invalid input rejected', () => {
  for (const bad of ['0', '2001', '1.5', '"a"', '[3]', 'null']) assert.throws(() => parseInput(bad))
})
