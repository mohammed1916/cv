export const code = [
  { line: 1, text: "answer = empty list" },
  { line: 2, text: "for each query q" },
  { line: 3, text: "busy = empty set" },
  { line: 4, text: "for each log (server, time)" },
  { line: 5, text: "if q - x <= time <= q" },
  { line: 6, text: "add server to busy" },
  { line: 7, text: "append n - size of busy to answer" },
  { line: 8, text: "return answer" },
]

export const python = `def countZeroRequestServers(n, logs, x, queries):
    answer = []
    for q in queries:
        busy = set()
        for server, time in logs:
            if q - x <= time <= q:
                busy.add(server)
        answer.append(n - len(busy))
    return answer`

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Number.isInteger(data.n) || !Array.isArray(data.logs) || !Number.isInteger(data.x) || !Array.isArray(data.queries)) throw new Error('Use an object with integers n and x, an array logs of [server, time] pairs, and an array queries, for example {"n":3,"logs":[[1,3],[2,6],[1,5]],"x":5,"queries":[10,11]}.')
  if (data.n < 1 || data.n > 10) throw new Error('n must be from 1 to 10 for this visualization.')
  if (data.logs.length < 1 || data.logs.length > 10) throw new Error('logs must have 1 to 10 entries for this visualization.')
  if (data.logs.some(l => !Array.isArray(l) || l.length !== 2 || !Number.isInteger(l[0]) || l[0] < 1 || l[0] > data.n || !Number.isInteger(l[1]) || l[1] < 1 || l[1] > 100)) throw new Error('each log must be [server, time] with 1 <= server <= n and 1 <= time <= 100.')
  if (data.x < 1 || data.x > 100) throw new Error('x must be from 1 to 100.')
  if (data.queries.length < 1 || data.queries.length > 10 || data.queries.some(q => !Number.isInteger(q) || q < 1 || q > 100)) throw new Error('queries must have 1 to 10 integers from 1 to 100.')
  return { n: data.n, logs: data.logs.map(l => [...l]), x: data.x, queries: [...data.queries] }
}

export function buildTrace({ n, logs, x, queries }) {
  const frames = []
  const answer = []
  frames.push({ phase: 'setup', activeLine: 1, pythonLine: 2, query: -1, busy: [], answer: [], message: 'Start with an empty answer list.' })
  for (const q of queries) {
    frames.push({ phase: 'query', activeLine: 2, pythonLine: 3, query: q, busy: [], answer: [...answer], message: `Query ${q}: the window is [${q - x}, ${q}].` })
    const busy = new Set()
    frames.push({ phase: 'query', activeLine: 3, pythonLine: 4, query: q, busy: [], answer: [...answer], message: 'Start with no busy servers.' })
    for (const [server, time] of logs) {
      frames.push({ phase: 'log', activeLine: 4, pythonLine: 5, query: q, busy: [...busy], answer: [...answer], message: `Read log: server ${server} at time ${time}.` })
      const inside = q - x <= time && time <= q
      frames.push({ phase: 'check', activeLine: 5, pythonLine: 6, query: q, busy: [...busy], answer: [...answer], message: inside ? `${time} is inside the window.` : `${time} is outside the window.` })
      if (inside) {
        busy.add(server)
        frames.push({ phase: 'mark', activeLine: 6, pythonLine: 7, query: q, busy: [...busy], answer: [...answer], message: `Server ${server} is busy.` })
      }
    }
    const idle = n - busy.size
    answer.push(idle)
    frames.push({ phase: 'answer', activeLine: 7, pythonLine: 8, query: q, busy: [...busy], answer: [...answer], message: `${n} servers minus ${busy.size} busy gives ${idle} idle.` })
  }
  frames.push({ phase: 'done', activeLine: 8, pythonLine: 9, query: -1, busy: [], answer: [...answer], result: [...answer], message: `Return [${answer.join(', ')}].` })
  return { input: { n, logs, x, queries }, result: answer, frames }
}
