import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const run = (homepage, ops) => buildTrace({ homepage, methods: ops.map(([name]) => name), args: ops.map(([, arg]) => [arg].filter(v => v !== undefined)) }).result

test('1472 worked example', () => {
  const ops = [['visit', 'google.com'], ['visit', 'facebook.com'], ['visit', 'youtube.com'], ['back', 1], ['back', 1], ['forward', 1], ['visit', 'linkedin.com'], ['forward', 2], ['back', 2], ['back', 7]]
  assert.deepEqual(run('leetcode.com', ops), [null, null, null, 'facebook.com', 'google.com', 'facebook.com', null, 'linkedin.com', 'google.com', 'leetcode.com'])
})

test('1472 back stops at the homepage and forward stops at the last page', () => {
  assert.deepEqual(run('a.com', [['back', 5], ['forward', 5], ['visit', 'b.com'], ['forward', 1]]), ['a.com', 'a.com', null, 'b.com'])
})

test('1472 rejects an unknown method', () => {
  assert.throws(() => parseInput('{"homepage":"a.com","ops":[["jump",1]]}'))
})

// Oracle: keep the visited pages as a plain array and recompute the cursor from scratch on every call.
test('1472 random operations match a slice-based oracle', () => {
  let seed = 1472
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const ops = [], expected = []
    let pages = ['home.com'], cursor = 0
    for (let k = 0; k < 1 + rnd(12); k++) {
      const pick = rnd(3)
      if (pick === 0) {
        const url = `p${rnd(5)}.com`
        ops.push(['visit', url]); expected.push(null)
        pages = [...pages.slice(0, cursor + 1), url]; cursor = pages.length - 1
      } else if (pick === 1) {
        const steps = rnd(4)
        ops.push(['back', steps]); cursor = Math.max(0, cursor - steps); expected.push(pages[cursor])
      } else {
        const steps = rnd(4)
        ops.push(['forward', steps]); cursor = Math.min(pages.length - 1, cursor + steps); expected.push(pages[cursor])
      }
    }
    assert.deepEqual(run('home.com', ops), expected, JSON.stringify(ops))
  }
})
