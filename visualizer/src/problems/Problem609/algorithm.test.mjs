import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const norm = groups => groups.map(g => [...g].sort().join('|')).sort()

test('609 official example', () => {
  const run = buildTrace(['root/a 1.txt(abcd) 2.txt(efgh)', 'root/c 3.txt(abcd)', 'root/c/d 4.txt(efgh)', 'root 4.txt(efgh)'])
  assert.deepEqual(norm(run.result), norm([['root/a/1.txt', 'root/c/3.txt'], ['root/a/2.txt', 'root/c/d/4.txt', 'root/4.txt']]))
})

test('609 random filesystems match a pairwise brute-force comparison', () => {
  let state = 17
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  const contents = ['a', 'b', 'c']
  for (let t = 0; t < 300; t++) {
    const lines = Array.from({ length: 1 + rand(4) }, (_, d) => `dir${d} ` + Array.from({ length: 1 + rand(3) }, (_, f) => `f${f}.txt(${contents[rand(3)]})`).join(' '))
    const files = lines.flatMap(line => { const [dir, ...fs] = line.split(' '); return fs.map(f => ({ path: `${dir}/${f.slice(0, f.indexOf('('))}`, content: f.slice(f.indexOf('(') + 1, -1) })) })
    const expected = []
    for (let i = 0; i < files.length; i++) {
      const group = [files[i].path]
      for (let j = i + 1; j < files.length; j++) if (files[j].content === files[i].content) group.push(files[j].path)
      if (group.length > 1 && files.findIndex(f => f.content === files[i].content) === i) expected.push(group)
    }
    assert.deepEqual(norm(buildTrace(lines).result), norm(expected), JSON.stringify(lines))
  }
})

test('609 rejects malformed entries', () => {
  assert.throws(() => parseInput('["root"]'))
  assert.throws(() => parseInput('["root a.txt"]'))
})
