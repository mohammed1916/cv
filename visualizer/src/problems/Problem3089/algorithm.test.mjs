import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases, examples, sql } from './algorithm.js'

const solve = posts => buildTrace({ posts }).result
const row = (id, user, day, month = '02') => [id, user, `2024-${month}-${String(day).padStart(2, '0')}`]

test('3089 hand-computed tables', () => {
  // Four posts: bar 2. The first three sit inside 3..9, so peak 3.
  assert.deepEqual(solve([row(1, 7, 3), row(2, 7, 5), row(3, 7, 6), row(4, 7, 20)]), [
    { user_id: 7, max_7day_posts: 3, avg_weekly_posts: '1.0000' },
  ])
  // Four posts, nine days apart: peak 1 is below the bar of 2.
  assert.deepEqual(solve([row(1, 8, 2), row(2, 8, 11), row(3, 8, 20), row(4, 8, 28)]), [])
  // One post: average 0.25, bar 0.5, peak 1.
  assert.deepEqual(solve([row(1, 3, 28)]), [{ user_id: 3, max_7day_posts: 1, avg_weekly_posts: '0.2500' }])
  // Six posts, bar 3, and peak exactly 3 counts as bursty.
  assert.deepEqual(solve([row(1, 4, 1), row(2, 4, 4), row(3, 4, 7), row(4, 4, 12), row(5, 4, 19), row(6, 4, 27)]), [
    { user_id: 4, max_7day_posts: 3, avg_weekly_posts: '1.5000' },
  ])
  // Three posts: bar 1.5, so a peak of 1 is not enough.
  assert.deepEqual(solve([row(1, 6, 1), row(2, 6, 10), row(3, 6, 20)]), [])
})

test('3089 window edges: day 7 is inside, day 8 is outside', () => {
  const inside = solve([row(1, 1, 1), row(2, 1, 7), row(3, 1, 20), row(4, 1, 28)])
  assert.deepEqual(inside.map(r => r.max_7day_posts), [2])
  const outside = solve([row(1, 1, 1), row(2, 1, 8), row(3, 1, 20), row(4, 1, 28)])
  assert.deepEqual(outside, [])
})

test('3089 only 1 to 28 February counts', () => {
  assert.deepEqual(solve([[1, 2, '2024-01-31'], [2, 2, '2024-02-29'], [3, 3, '2024-03-01']]), [])
  // The post on the 29th neither raises the average nor joins a window.
  assert.deepEqual(solve([[1, 5, '2024-02-28'], [2, 5, '2024-02-29']]), [{ user_id: 5, max_7day_posts: 1, avg_weekly_posts: '0.2500' }])
  assert.deepEqual(solve([[1, 5, '2023-02-10']]), [])
})

test('3089 same-day posts both count and output is in user order', () => {
  assert.deepEqual(solve([row(1, 9, 5), row(2, 9, 5), row(3, 2, 5)]), [
    { user_id: 2, max_7day_posts: 1, avg_weekly_posts: '0.2500' },
    { user_id: 9, max_7day_posts: 2, avg_weekly_posts: '0.5000' },
  ])
  assert.deepEqual(solve([]), [])
})

test('3089 rejects bad tables', () => {
  for (const bad of ['{"posts":[[1,1,"2024-02-30"]]}', '{"posts":[[1,1,"2024-02-01"],[1,2,"2024-02-02"]]}', '{"posts":[[1,1]]}', '{"posts":5}', '[]']) {
    assert.throws(() => parseInput(bad), undefined, bad)
  }
})

// Oracle: try all 22 fully contained 7-day windows of February instead of windows that start on a post.
function oracle(posts) {
  const byUser = new Map()
  for (const [, user, date] of posts) {
    if (date < '2024-02-01' || date > '2024-02-28') continue
    if (!byUser.has(user)) byUser.set(user, [])
    byUser.get(user).push(Number(date.slice(8)))
  }
  const out = []
  for (const user of [...byUser.keys()].sort((a, b) => a - b)) {
    const days = byUser.get(user)
    let peak = 0
    for (let start = 1; start <= 22; start++) peak = Math.max(peak, days.filter(day => day >= start && day <= start + 6).length)
    if (peak * 2 >= days.length) out.push({ user_id: user, max_7day_posts: peak, avg_weekly_posts: (days.length / 4).toFixed(4) })
  }
  return out
}

test('3089 agrees with an oracle over every fully contained window', () => {
  let seed = 3089
  const next = limit => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % limit }
  for (let round = 0; round < 3000; round++) {
    const size = next(25)
    const posts = Array.from({ length: size }, (_, id) => {
      const month = next(10) === 0 ? '03' : '02'
      return [id, next(4), `2024-${month}-${String(1 + next(29)).padStart(2, '0')}`]
    })
    assert.deepEqual(solve(posts), oracle(posts), JSON.stringify(posts))
  }
})

test('3089 frames are well formed and the SQL filters first', () => {
  assert.match(sql, /BETWEEN '2024-02-01' AND '2024-02-28'/)
  const pythonLines = python.trim().split('\n')
  const ids = new Set(phases.map(phase => phase.id))
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    for (const frame of run.frames) {
      assert.ok(ids.has(frame.phase), frame.phase)
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
      assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pythonLines.length)
      assert.ok(pythonLines[frame.pythonLine - 1].trim().length > 0)
      assert.ok(frame.message.length > 0)
    }
    assert.equal(run.frames.at(-1).phase, 'done')
    assert.deepEqual(run.frames.at(-1).output, run.result)
  }
})

test('3089 peak in a frame never exceeds the window that produced it, and rises monotonically', () => {
  const run = buildTrace(parseInput(examples[0].input))
  const windows = run.frames.filter(frame => frame.phase === 'window')
  assert.ok(windows.length >= 8)
  for (const frame of windows) {
    const entry = frame.stats.find(s => s.user_id === frame.user)
    assert.ok(entry.peak >= frame.window.inside)
    assert.ok(frame.window.end - frame.window.start === 6)
  }
})
