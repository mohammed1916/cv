import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace, code, python, phases, hostname } from './algorithm.js'

const CODE_LINES = new Map(code.map(entry => [entry.line, entry.text]))
const PYTHON_LINES = python.split('\n')
const PHASE_IDS = new Set(phases.map(phase => phase.id))

const EXAMPLE = '{"startUrl":"http://news.example/a","edges":{"http://news.example/a":["http://news.example/b","http://news.example.org/x"],"http://news.example/b":["http://news.example/a","http://news.example/c"],"http://news.example/c":[]}}'
const PREFIX = '{"startUrl":"http://example.org/","edges":{"http://example.org/":["http://example.org.evil.com/","http://example.org/docs"],"http://example.org/docs":["http://example.org/"]}}'

function assertFrameInvariants(run) {
  assert.ok(run.frames.length > 0)
  for (const frame of run.frames) {
    assert.ok(PHASE_IDS.has(frame.phase), `phase ${frame.phase}`)
    assert.ok(CODE_LINES.get(frame.activeLine)?.trim(), `pseudocode line ${frame.activeLine}`)
    assert.ok(PYTHON_LINES[frame.pythonLine - 1]?.trim(), `python line ${frame.pythonLine}`)
  }
}

// Independent oracle: depth-first reachability that checks the hostname of every link.
function oracle({ startUrl, edges }) {
  const host = new URL(startUrl).hostname
  const seen = new Set([startUrl])
  const stack = [startUrl]
  while (stack.length) {
    const url = stack.pop()
    for (const link of edges[url] ?? []) {
      if (new URL(link).hostname === host && !seen.has(link)) {
        seen.add(link)
        stack.push(link)
      }
    }
  }
  return [...seen].sort()
}

test('the first example follows the same host and skips the other host', () => {
  const run = buildTrace(parseInput(EXAMPLE))
  assert.deepEqual([...run.result].sort(), ['http://news.example/a', 'http://news.example/b', 'http://news.example/c'])
  assertFrameInvariants(run)
})

test('a hostname that only shares a prefix is not crawled', () => {
  const run = buildTrace(parseInput(PREFIX))
  assert.deepEqual([...run.result].sort(), ['http://example.org/', 'http://example.org/docs'])
  assertFrameInvariants(run)
})

test('hostname reads the text between the scheme and the first slash', () => {
  assert.equal(hostname('http://example.org/a/b'), 'example.org')
  assert.equal(hostname('https://example.org'), 'example.org')
  assert.notEqual(hostname('http://example.org.evil.com/'), hostname('http://example.org/'))
})

test('a page with no links is still reached and reported', () => {
  const run = buildTrace(parseInput('{"startUrl":"https://a.test/","edges":{}}'))
  assert.deepEqual(run.result, ['https://a.test/'])
})

test('parseInput rejects malformed URLs and link lists', () => {
  assert.throws(() => parseInput('{"startUrl":"example.org","edges":{}}'), /http or https/)
  assert.throws(() => parseInput('{"startUrl":"http://a.test/","edges":{"http://a.test/":"http://a.test/b"}}'), /must be URL strings/)
  assert.throws(() => parseInput('{"startUrl":"http://a.test/","edges":{"bad":[]}}'), /Bad page URL/)
})

test('the trace agrees with the depth-first oracle on random sites', () => {
  let seed = 1236
  const next = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed
  }
  const hosts = ['http://a.test', 'http://a.test.evil', 'http://b.test']
  for (let trial = 0; trial < 200; trial += 1) {
    const pages = Array.from({ length: 2 + (next() % 7) }, (_, k) => `${hosts[next() % hosts.length]}/p${k}`)
    const edges = {}
    for (const page of pages) {
      edges[page] = Array.from({ length: next() % 4 }, () => pages[next() % pages.length])
    }
    const input = { startUrl: pages[0], edges }
    const run = buildTrace(parseInput(JSON.stringify(input)))
    assert.deepEqual([...run.result].sort(), oracle(input), JSON.stringify(input))
    assertFrameInvariants(run)
  }
})
