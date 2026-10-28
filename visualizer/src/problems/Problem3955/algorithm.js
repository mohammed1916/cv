export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Number.isInteger(data.n) || !Number.isInteger(data.k)) throw new Error('Use {"n": n, "k": k} with integers.')
  if (data.n < 1 || data.n > 8) throw new Error('n is an integer from 1 to 8 for the visualization.')
  if (data.k < 0 || data.k > (data.n * (data.n - 1)) / 2) throw new Error('k is an integer from 0 to n(n-1)/2.')
  return { n: data.n, k: data.k }
}

export function buildTrace(input) {
  const { n, k } = input
  const answers = []
  const frames = [{ phase: 'start', activeLine: L('let answers be'), text: '', cost: 0, accepted: null, answers: [], message: `Build strings of length ${n} with no adjacent 1s and cost at most ${k}.` }]
  const extend = (pos, previousOne, cost, text) => {
    if (pos === n) {
      const accepted = cost <= k
      if (accepted) answers.push(text)
      frames.push({ phase: 'leaf', activeLine: L('if pos equals n'), text, cost, accepted, answers: [...answers], message: accepted ? `"${text}" has cost ${cost}, so keep it.` : `"${text}" has cost ${cost}, above ${k}.` })
      return
    }
    extend(pos + 1, false, cost, text + '0')
    if (!previousOne && cost + pos <= k) extend(pos + 1, true, cost + pos, text + '1')
  }
  extend(0, false, 0, '')
  frames.push({ phase: 'done', activeLine: L('return answers'), text: '', cost: 0, accepted: null, answers: [...answers], message: `${answers.length} valid string(s).` })
  return { input, result: answers, frames }
}

export const code = `valid binary strings of length n with cost at most k
  let answers be an empty list
  define extend(pos, previousOne, cost, text)
    if pos equals n then
      if cost is at most k then append text to answers
      return
    extend with a 0 at pos
    if previousOne is false and cost plus pos is at most k then
      extend with a 1 at pos
  call extend(0, false, 0, empty text)
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def valid_binary_strings_with_cost_limit(n, k):
    answers = []

    def extend(pos, previous_one, cost, text):
        if pos == n:
            if cost <= k:
                answers.append(text)
            return
        extend(pos + 1, False, cost, text + '0')
        if not previous_one and cost + pos <= k:
            extend(pos + 1, True, cost + pos, text + '1')

    extend(0, False, 0, '')
    return answers
`
