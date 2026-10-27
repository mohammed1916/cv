export function parseInput(text) {
  const data = JSON.parse(text)
  const { list1, list2 } = data ?? {}
  const ok = a => Array.isArray(a) && a.length >= 1 && a.length <= 1000 && a.every(s => typeof s === 'string' && s.length >= 1 && s.length <= 30)
  if (!ok(list1) || !ok(list2)) throw new Error('Enter {"list1":[...],"list2":[...]}: 1–1,000 restaurant names each (1–30 characters).')
  if (new Set(list1).size !== list1.length || new Set(list2).size !== list2.length) throw new Error('Names within each list must be unique.')
  return { list1, list2 }
}

export function buildTrace({ list1, list2 }) {
  const index = new Map(list1.map((name, i) => [name, i]))
  let best = Infinity
  let answer = []
  const frames = [{ phase: 'start', j: -1, best: null, answer: [], activeLine: 2, message: `Index every restaurant in list 1 (${list1.length} names).` }]
  list2.forEach((name, j) => {
    const i = index.get(name)
    if (i === undefined) {
      frames.push({ phase: 'scan', j, name, sum: null, best: best === Infinity ? null : best, answer: [...answer], activeLine: 5, message: `${name} is not in list 1.` })
      return
    }
    const sum = i + j
    if (sum < best) { best = sum; answer = [name] }
    else if (sum === best) answer.push(name)
    frames.push({ phase: 'match', j, name, i, sum, best, answer: [...answer], activeLine: 7, message: `${name}: indices ${i} + ${j} = ${sum}. Best sum is now ${best}.` })
  })
  frames.push({ phase: 'done', j: list2.length - 1, best, answer: [...answer], result: answer, activeLine: 9, message: `Minimum index sum ${best}: ${answer.join(', ')}.` })
  return { input: { list1, list2 }, result: answer, frames }
}

export const code = `index each string of the first list by its position
start the best combined index at infinity and the winners as an empty list
for each string in the second list, with its position j
  if the string is not in the index, skip it
  otherwise if its index plus j is below the best, replace the winners
  if its index plus j equals the best, add the string to the winners
return the winners`.split('\n').map((text, index) => ({ line: index + 1, text }))

// The scan-family visualizer reports its own step numbers (1 setup, 4 scan, 5 return).
export const LINE_MAP = { 1: 1, 4: 5, 5: 7 }

export const python = `def min_index_sum_common(list1, list2):
    indices = {name: i for i, name in enumerate(list1)}
    best, output = float('inf'), []
    for j, name in enumerate(list2):
        i = indices.get(name)
        if i is None:
            continue
        if i + j < best:
            best = i + j
            output = []
        if i + j == best:
            output.append(name)
    return output`
