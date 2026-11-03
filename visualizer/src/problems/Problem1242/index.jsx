import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
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
    { label: 'Example', input: '{"start":"http://ex.com/a","links":{"http://ex.com/a":["http://ex.com/b","http://other.org/c"],"http://ex.com/b":["http://ex.com/a","http://ex.com/d"],"http://ex.com/d":[]}}' },
  ],
}

export default function WebCrawlerMultithreaded() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <ul aria-label="Crawl state">{step.state.map((line, index) => <li key={index}>{line}</li>)}</ul>
    <output aria-label="Current step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Every page is recorded the moment it is queued, so no page is fetched twice even when two links point at it.</p>
    <p>A concurrent crawler does the same check under a lock, and its answer must match this single-threaded order as a set.</p>
  </>} />
}
