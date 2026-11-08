import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  number: '1242',
  phases: [
    { id: 'start', label: 'Start', description: 'Fix the host to crawl.' },
    { id: 'visit', label: 'Visit', description: 'Record the next page from the queue.' },
    { id: 'queue', label: 'Queue', description: 'A new page on the same host is queued.' },
    { id: 'skip', label: 'Skip', description: 'Another host or an already seen page is ignored.' },
    { id: 'done', label: 'Result', description: 'Report the visit order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with start url and links: { url: [urls] }',
  url: 'https://leetcode.com/problems/web-crawler-multithreaded/',
  complexity: 'O(V + E) for the pages and links reached. The concurrent version uses the same visited rule under a lock.',
  examples: [
    { label: 'Example', input: '{"start":"http://ex.com/a","links":{"http://ex.com/a":["http://ex.com/b","http://other.org/c"],"http://ex.com/b":["http://ex.com/a","http://ex.com/d"]}}' },
    { label: 'Start page with no links', input: '{\"start\":\"https://site.test/\",\"links\":{\"https://site.test/\":[]}}' },
    { label: 'Two pages link to each other', input: '{\"start\":\"https://site.test/a\",\"links\":{\"https://site.test/a\":[\"https://site.test/b\"],\"https://site.test/b\":[\"https://site.test/a\"]}}' },
    { label: 'Long run: ten pages', input: '{\"start\":\"https://site.test/a\",\"links\":{\"https://site.test/a\":[\"https://site.test/h\",\"https://site.test/j\"],\"https://site.test/b\":[\"https://site.test/c\",\"https://site.test/g\"],\"https://site.test/c\":[\"https://site.test/b\"],\"https://site.test/d\":[\"https://site.test/g\",\"https://site.test/f\"],\"https://site.test/e\":[\"https://site.test/d\",\"https://site.test/j\"],\"https://site.test/f\":[\"https://site.test/d\",\"https://site.test/c\"],\"https://site.test/g\":[\"https://site.test/i\",\"https://site.test/a\"],\"https://site.test/h\":[\"https://site.test/f\",\"https://site.test/e\"],\"https://site.test/i\":[\"https://site.test/j\",\"https://site.test/b\"],\"https://site.test/j\":[\"https://site.test/c\",\"https://site.test/a\"]}}' },
  ],
}

const MAX_NODES = 24

// The trace keeps the visit order and queued entries as text, so the graph is rebuilt from the page links.
function readState(state) {
  const queued = state.filter(line => line.startsWith('queued ')).map(line => line.slice('queued '.length))
  const order = state.filter(line => !line.startsWith('queued ') && !line.startsWith('host '))
  return { queued, order }
}

export default function WebCrawlerMultithreaded() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const pages = [...new Set([run.input.start, ...Object.keys(run.input.links), ...Object.values(run.input.links).flat()])]
    const tooBig = pages.length > MAX_NODES
    const index = new Map(pages.map((p, i) => [p, i]))
    const edges = tooBig ? [] : Object.entries(run.input.links).flatMap(([from, targets]) =>
      targets.filter(to => index.has(to)).map(to => [index.get(from), index.get(to)]))
    const { queued, order } = readState(step.state)
    const current = step.phase === 'visit' && order.length ? index.get(order[order.length - 1]) : null
    const label = p => p.replace(/^https?:\/\//, '')
    return <>
      {tooBig
        ? <p>{pages.length} pages are too many to draw; the visit order is listed below.</p>
        : <GraphTraversalView
          title="Pages and links on the same host"
          n={pages.length}
          edges={edges}
          directed
          labels={pages.map(label)}
          current={current}
          visited={[...order, ...queued].map(p => index.get(p)).filter(i => i !== undefined)}
          done={order.map(p => index.get(p))}
          frontier={queued.map(p => index.get(p)).filter(i => i !== undefined)}
          frontierKind="queue"
          showFrontier
        />}
      <ol aria-label="Crawl state" style={{ paddingLeft: 20 }}>{step.state.map((line, i) => <li key={i}>{line}</li>)}</ol>
      <output aria-label="Current step">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Every page is recorded the moment it is queued, so no page is fetched twice even when two links point at it.</p>
    <p>A concurrent crawler does the same check under a lock, and its answer must match this single-threaded order as a set.</p>
  </>} />
}
