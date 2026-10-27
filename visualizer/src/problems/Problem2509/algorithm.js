export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with n and queries.')
  const { n, queries } = data
  if (!Number.isInteger(n) || n < 2 || n > 4) throw new Error('n is the number of levels, an integer from 2 to 4.')
  const nodes = 2 ** n - 1
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 8) throw new Error('queries must be an array of 1 to 8 [a, b] pairs.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 2 || !Number.isInteger(q[0]) || !Number.isInteger(q[1]) || q[0] < 1 || q[1] < 1 || q[0] > nodes || q[1] > nodes) {
      throw new Error(`Each query is [a, b] with labels from 1 to ${nodes}.`)
    }
  }
  return { n, queries }
}

export const code = `cycle length after adding an edge between a and b for each query
  let answers be an empty list
  for each query [a, b]
  let steps be zero
  while a is not equal to b
  move the larger of a and b up one level by halving it
  add one to steps
  append steps plus one to answers
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ n, queries }) {
  const count = 2 ** n - 1
  const answers = []
  const frames = [{ phase: 'start', activeLine: L('let answers be'), nodes: [], message: `Perfect binary tree with ${count} nodes, labelled 1 at the root.` }]
  for (const [a0, b0] of queries) {
    let a = a0
    let b = b0
    let steps = 0
    const path = [a, b]
    frames.push({ phase: 'query', activeLine: L('for each query'), nodes: [a, b], message: `Connect ${a} and ${b}.` })
    while (a !== b) {
      if (a > b) a = Math.floor(a / 2)
      else b = Math.floor(b / 2)
      steps += 1
      path.push(a, b)
      frames.push({ phase: 'climb', activeLine: L('move the larger'), nodes: [a, b], message: `Climb to ${a} and ${b}; ${steps} step(s) so far.` })
    }
    answers.push(steps + 1)
    frames.push({ phase: 'answer', activeLine: L('append steps plus one'), nodes: [a], message: `The cycle has ${steps} + 1 = ${steps + 1} node(s).` })
  }
  frames.push({ phase: 'done', activeLine: L('return answers'), nodes: [], message: `Answers: [${answers.join(', ')}].` })
  return { input: { n, queries }, count, result: answers, frames }
}

export const python = `def cycle_length_queries(n, queries):
    answers = []
    for a, b in queries:
        steps = 0
        while a != b:
            if a > b:
                a //= 2
            else:
                b //= 2
            steps += 1
        answers.append(steps + 1)
    return answers
`
