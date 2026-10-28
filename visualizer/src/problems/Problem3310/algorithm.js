export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Number.isInteger(data.n) || !Number.isInteger(data.k) || !Array.isArray(data.invocations)) throw new Error('Use an object with integers n and k and an array invocations, for example {"n":4,"k":1,"invocations":[[1,2],[0,1],[3,2]]}.')
  if (data.n < 1 || data.n > 10) throw new Error('n must be 1 to 10.')
  if (data.k < 0 || data.k >= data.n) throw new Error('k must be a method number from 0 to n minus 1.')
  const okPair = p => Array.isArray(p) && p.length === 2 && p.every(v => Number.isInteger(v) && v >= 0 && v < data.n)
  if (!data.invocations.every(okPair)) throw new Error('Each invocation is a pair [a, b] of method numbers from 0 to n minus 1.')
  return { n: data.n, k: data.k, invocations: data.invocations }
}

export function buildTrace(input) {
  const { n, k, invocations } = input
  const marked = Array.from({ length: n }, () => false)
  marked[k] = true
  const stack = [k]
  const frames = [{ phase: 'start', activeLine: L('mark k as suspicious'), marked: marked.slice(), result: null, message: `Method ${k} is suspicious. Every method it can reach through invocations is suspicious too.` }]
  while (stack.length > 0) {
    const m = stack.pop()
    for (const [a, b] of invocations) {
      if (a === m && !marked[b]) {
        marked[b] = true
        stack.push(b)
        frames.push({ phase: 'mark', activeLine: L('mark b as suspicious'), marked: marked.slice(), result: null, message: `Method ${m} invokes ${b}, so ${b} is suspicious too.` })
      }
    }
  }
  let blocked = null
  for (const [a, b] of invocations) {
    if (!marked[a] && marked[b]) { blocked = [a, b]; break }
  }
  let result
  if (blocked) {
    result = Array.from({ length: n }, (_, i) => i)
    frames.push({ phase: 'blocked', activeLine: L('return all methods'), marked: marked.slice(), result, message: `Method ${blocked[0]} outside the set invokes suspicious method ${blocked[1]}, so nothing can be removed.` })
  } else {
    result = Array.from({ length: n }, (_, i) => i).filter(i => !marked[i])
    frames.push({ phase: 'done', activeLine: L('return the methods'), marked: marked.slice(), result, message: `No outside method calls into the suspicious set, so those methods are removed.` })
  }
  return { input, result, frames }
}

export const code = `remaining methods after removing the suspicious set (n, k, invocations)
  mark k as suspicious and set stack to [k]
  while stack is not empty
    pop a method m from stack
    for each invocation [m, b]
      if b is not yet suspicious then
        mark b as suspicious and push b onto stack
  for each invocation [a, b]
    if a is not suspicious and b is suspicious then
      return all methods
  return the methods that are not suspicious`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def remove_methods(n, k, invocations):
    suspicious = {k}
    stack = [k]
    while stack:
        m = stack.pop()
        for a, b in invocations:
            if a == m and b not in suspicious:
                suspicious.add(b)
                stack.append(b)
    for a, b in invocations:
        if a not in suspicious and b in suspicious:
            return list(range(n))
    return [i for i in range(n) if i not in suspicious]
`
