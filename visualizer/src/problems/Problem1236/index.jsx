import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HostLanesView from './HostLanesView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1236',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with startUrl and edges (each page maps to its links)',
  url: 'https://leetcode.com/problems/web-crawler/description/',
  complexity: 'O(V + E) time for V reachable pages and E links, with hostname checks per link. The visualization caps the site at 12 pages; the draft does not state an exact official bound. The HtmlParser is simulated by the edges map.',
  examples: [
    { label: 'Same host only', input: '{"startUrl":"http://news.example/a","edges":{"http://news.example/a":["http://news.example/b","http://news.example.org/x"],"http://news.example/b":["http://news.example/a","http://news.example/c"],"http://news.example/c":[]}}' },
    { label: 'Prefix trap', input: '{"startUrl":"http://example.org/","edges":{"http://example.org/":["http://example.org.evil.com/","http://example.org/docs"],"http://example.org/docs":["http://example.org/"]}}' },
  ],
}

export default function Problem1236WebCrawler() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <HostLanesView run={run} step={step} />}
      renderReasoning={() => (
        <p>Hostnames are compared exactly, read between the scheme and the first slash. A prefix such as example.org still differs from example.org.evil.com, so that link is never followed.</p>
      )}
    />
  )
}
