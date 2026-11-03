const URL_RE = /^https?:\/\/[a-z]+\.[a-z]+(\/[a-z]*)*$/
const host = url => url.split('/')[2]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input.start !== 'string' || !URL_RE.test(input.start)) throw new Error('start is a http or https url with a lowercase host.')
  if (!input.links || typeof input.links !== 'object' || Array.isArray(input.links)) throw new Error('links maps each url to a list of urls.')
  for (const [page, next] of Object.entries(input.links)) {
    if (!URL_RE.test(page) || !Array.isArray(next) || next.some(u => typeof u !== 'string' || !URL_RE.test(u))) throw new Error('Each links entry is a url mapped to a list of urls.')
  }
  return input
}

export function buildTrace({ start, links }) {
  const h = host(start)
  const seen = new Set([start])
  const queue = [start]
  const order = []
  const frames = [{ phase: 'start', pythonLine: PL('visited = {start}'), activeLine: L('start with the start page'), state: [`host ${h}`], message: `Crawl only ${h}.` }]
  while (queue.length) {
    const page = queue.shift()
    order.push(page)
    frames.push({ phase: 'visit', pythonLine: PL('order.append(page)'), activeLine: L('take the next page'), state: [...order], message: `Visit ${page}.` })
    for (const nxt of links[page] || []) {
      if (host(nxt) === h && !seen.has(nxt)) {
        seen.add(nxt)
        queue.push(nxt)
        frames.push({ phase: 'queue', pythonLine: PL('queue.append(nxt)'), activeLine: L('same host and is new'), state: [...order, `queued ${nxt}`], message: `${nxt} is on this host and new, so queue it.` })
      } else {
        frames.push({ phase: 'skip', pythonLine: PL('if nxt.split'), activeLine: L('same host and is new'), state: [...order], message: `${nxt} is skipped: other host or already seen.` })
      }
    }
  }
  frames.push({ phase: 'done', pythonLine: PL('return order'), activeLine: L('return the visited pages'), state: [...order], message: `${order.length} pages were visited.` })
  return { input: { start, links }, result: order, frames }
}

export const code = `host restricted breadth first crawl
  start with the start page
  mark the start page as seen and queue it
  while the queue is not empty
    take the next page from the queue and record it
    for each link on the page
      if the link has the same host and is new then mark it and queue it
  return the visited pages in order`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import deque

def crawl(start, links):
    host = start.split("/")[2]
    visited = {start}
    queue = deque([start])
    order = []
    while queue:
        page = queue.popleft()
        order.append(page)
        for nxt in links.get(page, []):
            if nxt.split("/")[2] == host and nxt not in visited:
                visited.add(nxt)
                queue.append(nxt)
    return order
`
const PL = s => python.split('\n').findIndex(l => l.includes(s)) + 1
