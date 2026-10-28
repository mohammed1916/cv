export function parseInput(text) {
  const input = JSON.parse(text)
  const { names, heights } = input ?? {}
  if (!Array.isArray(names) || !Array.isArray(heights)) throw new Error('Use {"names": [...], "heights": [...]}.')
  if (names.length < 1 || names.length > 12 || names.length !== heights.length) throw new Error('names and heights must have the same length, from 1 to 12.')
  if (names.some(n => typeof n !== 'string' || !/^[A-Za-z]{1,10}$/.test(n))) throw new Error('Each name is 1 to 10 English letters.')
  if (heights.some(h => !Number.isInteger(h) || h < 1 || h > 1000)) throw new Error('Heights are integers from 1 to 1000.')
  if (new Set(heights).size !== heights.length) throw new Error('Heights must be distinct.')
  return { names, heights }
}

export function buildTrace(input) {
  const working = input.names.map((name, index) => ({ name, height: input.heights[index], index }))
  const result = []
  const taken = []
  const frames = [{ phase: 'start', activeLine: L('set result to an empty list'), picked: null, taken: [], result: [], message: 'Pair each name with its height. Nobody has been placed yet.' }]
  while (working.length > 0) {
    let best = 0
    for (let i = 1; i < working.length; i++) if (working[i].height > working[best].height) best = i
    frames.push({ phase: 'find', activeLine: L('find the tallest'), picked: working[best].index, taken: [...taken], result: [...result], message: `${working[best].name} at ${working[best].height} cm is the tallest remaining.` })
    const [person] = working.splice(best, 1)
    result.push(person.name)
    taken.push(person.index)
    frames.push({ phase: 'take', activeLine: L('take the name'), picked: person.index, taken: [...taken], result: [...result], message: `Append ${person.name} to the result.` })
  }
  frames.push({ phase: 'done', activeLine: L('return result'), picked: null, taken: [...taken], result: [...result], message: `Order from tallest to shortest: ${result.join(', ')}.` })
  return { input, result, frames }
}

export const code = `sort the people from tallest to shortest
  set result to an empty list
  pair each name with its height in a working list
  repeat while the working list is not empty
    find the tallest remaining person
    take the name of that person and append it to the result
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sort_the_people(names, heights):
    result = []
    working = list(zip(names, heights))
    while working:
        best = 0
        for i in range(1, len(working)):
            if working[i][1] > working[best][1]:
                best = i
        result.append(working.pop(best)[0])
    return result
`
