// LeetCode 1236: Web Crawler. A breadth-first crawl from startUrl that follows only links whose
// hostname equals the start page's hostname. Hostnames are read between the scheme and the next
// slash, so "http://example.org.evil.com/x" is a different host from "http://example.org/".
const MAX_PAGES = 12

export const phases = [
  { id: 'setup', label: 'Start', description: 'Read the start page and its hostname.' },
  { id: 'pop', label: 'Visit', description: 'Take the next page from the queue.' },
  { id: 'link', label: 'Check link', description: 'Test one link from the page.' },
  { id: 'queue', label: 'Queue', description: 'Record a new same-host page.' },
  { id: 'skip', label: 'Skip', description: 'Leave out a seen or other-host link.' },
  { id: 'done', label: 'Result', description: 'Report every reached page.' },
]

export const code = `FUNCTION crawl(startUrl, getUrls)
    host ← hostname of startUrl
    visited ← [startUrl]; queue ← [startUrl]
    WHILE queue is not empty
        url ← pop front of queue
        FOR each link in getUrls(url)
            IF hostname of link equals host AND link is not visited THEN
                add link to visited and queue
            ELSE skip link
    RETURN visited`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(entry => entry.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `from collections import deque


def hostname(url):
    return url.split("/")[2]


def crawl(start_url, get_urls):
    host = hostname(start_url)
    visited = [start_url]
    seen = {start_url}
    queue = deque([start_url])
    while queue:
        url = queue.popleft()
        for link in get_urls(url):
            if hostname(link) == host and link not in seen:
                seen.add(link)
                visited.append(link)
                queue.append(link)
    return visited


if __name__ == "__main__":
    import sys, json
    data = json.loads(sys.stdin.read())
    edges = data["edges"]
    print(json.dumps(crawl(data["startUrl"], lambda url: edges.get(url, []))))
`

const PYTHON_LINES = python.split('\n')
const P = s => {
  const index = PYTHON_LINES.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

// The draft's HtmlParser is simulated by an adjacency map: each page lists its outgoing links.
export function hostname(url) {
  return url.split('/')[2]
}

const URL_PATTERN = /^https?:\/\/[^/\s]+(\/\S*)?$/

export function parseInput(text) {
  const input = typeof text === 'string' ? JSON.parse(text) : text
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with startUrl and edges.')
  const { startUrl, edges } = input
  if (typeof startUrl !== 'string' || !URL_PATTERN.test(startUrl)) throw new Error('startUrl is an http or https URL.')
  if (!edges || typeof edges !== 'object' || Array.isArray(edges)) throw new Error('edges maps each page to its list of links.')
  const pages = Object.keys(edges)
  if (pages.length > MAX_PAGES) throw new Error(`The visualization caps the site at ${MAX_PAGES} pages.`)
  for (const page of pages) {
    if (!URL_PATTERN.test(page)) throw new Error(`Bad page URL: ${page}`)
    if (!Array.isArray(edges[page]) || !edges[page].every(link => typeof link === 'string' && URL_PATTERN.test(link))) {
      throw new Error(`Links from ${page} must be URL strings.`)
    }
  }
  return { startUrl, edges }
}

export function buildTrace({ startUrl, edges }) {
  const frames = []
  const host = hostname(startUrl)
  const visited = [startUrl]
  const seen = new Set([startUrl])
  const queue = [startUrl]
  const emit = (phase, codeText, pyText, message, extra = {}) => frames.push({
    phase, activeLine: L(codeText), pythonLine: P(pyText), message,
    host, visited: visited.slice(), queue: queue.slice(), current: null, links: [], link: null, status: null, ...extra,
  })
  emit('setup', 'host ← hostname of startUrl', 'host = hostname(start_url)', `Crawl only pages on ${host}.`)
  while (queue.length) {
    const url = queue.shift()
    const links = edges[url] ?? []
    emit('pop', 'url ← pop front of queue', 'url = queue.popleft()', `Open ${url}.`, { current: url })
    const statuses = []
    for (const link of links) {
      let status
      if (hostname(link) !== host) status = 'other-host'
      else if (seen.has(link)) status = 'seen'
      else status = 'new'
      statuses.push({ link, status })
      if (status === 'new') {
        seen.add(link)
        visited.push(link)
        queue.push(link)
        emit('queue', 'add link to visited and queue', 'visited.append(link)', `${link} is on ${host} and new; queue it.`, { current: url, links: statuses.slice(), link, status })
      } else {
        emit('skip', 'ELSE skip link', 'if hostname(link) == host and link not in seen', status === 'other-host'
          ? `${link} is on ${hostname(link)}; not followed.`
          : `${link} was already seen; skip it.`, { current: url, links: statuses.slice(), link, status })
      }
    }
    if (!links.length) emit('link', 'FOR each link in getUrls(url)', 'for link in get_urls(url)', `${url} has no links.`, { current: url, links: [] })
  }
  emit('done', 'RETURN visited', 'return visited', `${visited.length} page${visited.length === 1 ? '' : 's'} reached on ${host}.`, { visited: visited.slice(), queue: [] })
  return { input: { startUrl, edges }, result: visited.slice(), frames }
}
