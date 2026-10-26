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

export const code = `def findRestaurant(list1, list2):
    index = {name: i for i, name in enumerate(list1)}
    best, answer = inf, []
    for j, name in enumerate(list2):
        if name in index:
            total = index[name] + j
            if total < best: best, answer = total, [name]
            elif total == best: answer.append(name)
    return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
