import test from 'node:test'
import assert from 'node:assert/strict'
import { describeIntervalRelation, eventsFromIntervals, intervalTrackLayout, intervalView, intervalsOverlap, sweepEventRows, MAX_INTERVALS } from './intervalModel.js'

test('half-open ranges that only touch do not overlap; closed ranges do', () => {
  assert.equal(intervalsOverlap({ start: 1, end: 2 }, { start: 2, end: 3 }), false)
  assert.equal(intervalsOverlap({ start: 1, end: 2 }, { start: 2, end: 3 }, true), true)
  assert.match(describeIntervalRelation({ start: 1, end: 2 }, { start: 2, end: 3 }), /only touch at 2/)
  assert.match(describeIntervalRelation({ start: 1, end: 4 }, { start: 3, end: 6 }), /overlap on \[3, 4\)/)
  assert.match(describeIntervalRelation({ start: 1, end: 2 }, { start: 5, end: 6 }), /disjoint/)
})

test('overlapping bars get different lanes, touching half-open bars share one', () => {
  const { tracks } = intervalTrackLayout([{ start: 0, end: 5 }, { start: 3, end: 8 }, { start: 5, end: 9 }])
  const [track] = tracks
  assert.equal(track.bars[0].lane, 0)
  assert.equal(track.bars[1].lane, 1)
  assert.equal(track.bars[2].lane, 0)
  assert.equal(track.lanes, 2)
  assert.ok(track.bars.every(b => b.left >= 0 && b.left + b.width <= 100.0001))
})

test('groups become separate tracks on a shared axis and a point interval stays visible', () => {
  const { tracks, markerLeft } = intervalTrackLayout([{ start: 0, end: 4, group: 'Input' }, { start: 2, end: 2, group: 'Result' }], { marker: 2 })
  assert.deepEqual(tracks.map(t => t.group), ['Input', 'Result'])
  assert.ok(tracks[1].bars[0].width >= 1.2)
  assert.ok(markerLeft > 0 && markerLeft < 100)
})

test('sweep rows keep a running count and flag the peak', () => {
  const events = eventsFromIntervals([{ start: 0, end: 30 }, { start: 5, end: 10 }, { start: 15, end: 20 }])
  assert.deepEqual(events.map(e => e.pos), [0, 5, 10, 15, 20, 30])
  const rows = sweepEventRows(events, 3)
  assert.deepEqual(rows.map(r => r.running), [1, 2, 1, 2, 1, 0])
  assert.deepEqual(rows.map(r => r.state), ['done', 'done', 'done', 'current', 'pending', 'pending'])
  assert.equal(rows[1].isPeak, true)
  assert.equal(rows[3].isPeak, true)
})

test('ends sort before starts at the same position so touching ranges do not stack', () => {
  const events = eventsFromIntervals([{ start: 0, end: 5 }, { start: 5, end: 9 }])
  assert.deepEqual(sweepEventRows(events).map(r => r.running), [1, 0, 1, 0])
})

test('intervalView returns nothing for unreadable input', () => {
  assert.deepEqual(intervalView({ intervals: [] }), {})
  assert.deepEqual(intervalView({ intervals: Array.from({ length: MAX_INTERVALS + 1 }, (_, i) => ({ start: i, end: i + 1 })) }), {})
  assert.deepEqual(intervalView({ intervals: [{ start: 1, end: NaN }] }), {})
  assert.equal(intervalView({ intervals: [{ start: 1, end: 3 }], events: [{ pos: 1, delta: 1 }] }).interval.events.length, 1)
})
