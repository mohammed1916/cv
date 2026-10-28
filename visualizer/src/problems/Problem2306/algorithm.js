const IDEA = /^[a-z]{2,8}$/

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || !Array.isArray(data.ideas)) throw new Error('Use {"ideas": [...]} with 2 to 30 names.')
  const { ideas } = data
  if (ideas.length < 2 || ideas.length > 30) throw new Error('Use 2 to 30 names.')
  if (ideas.some(s => typeof s !== 'string' || !IDEA.test(s))) throw new Error('Each name is 2 to 8 lowercase letters.')
  if (new Set(ideas).size !== ideas.length) throw new Error('Names must be distinct.')
  return { ideas }
}

export function buildTrace(input) {
  const { ideas } = input
  const groups = new Map()
  const frames = []
  const snap = () => [{ name: 'groups', keyLabel: 'first letter', valueLabel: 'suffixes', isSet: false, entries: [...groups].map(([letter, set]) => [letter, [...set].join(', ')]) }]
  frames.push({ phase: 'start', activeLine: L('count valid ordered pairs'), maps: snap(), ops: [], result: 0, message: 'Only the first letter changes in a swap, so group the names by first letter. The rest of each name decides everything.' })
  for (const idea of ideas) {
    const letter = idea[0]
    if (!groups.has(letter)) groups.set(letter, new Set())
    groups.get(letter).add(idea.slice(1))
  }
  frames.push({ phase: 'group', activeLine: L('add its suffix'), maps: snap(), ops: [], result: 0, message: `${ideas.length} names are grouped under ${groups.size} first letter(s).` })
  const letters = [...groups.keys()].sort()
  let answer = 0
  for (let i = 0; i < letters.length; i++) {
    for (let j = i + 1; j < letters.length; j++) {
      const a = groups.get(letters[i]), b = groups.get(letters[j])
      const onlyA = [...a].filter(s => !b.has(s))
      const onlyB = [...b].filter(s => !a.has(s))
      answer += 2 * onlyA.length * onlyB.length
      frames.push({ phase: 'pair', activeLine: L('add 2 times only_a'), maps: snap(), ops: [], result: answer,
        message: `${letters[i]} and ${letters[j]}: ${onlyA.length} suffix(es) only under ${letters[i]}, ${onlyB.length} only under ${letters[j]}. Both orders add ${2 * onlyA.length * onlyB.length}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), maps: snap(), ops: [], result: answer, message: `Valid ordered pairs: ${answer}.` })
  return { input, result: answer, frames }
}

export const code = `count valid ordered pairs of company names
groups = empty map from first letter to a set of suffixes
for each idea
  add its suffix (the rest after the first letter) to the set of its first letter
answer = 0
for each pair of first letters a and b, with a before b
  only_a = suffixes in group a that are missing from group b
  only_b = suffixes in group b that are missing from group a
  add 2 times only_a times only_b to answer
return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def distinct_names(ideas):
    groups = {}
    for idea in ideas:
        groups.setdefault(idea[0], set()).add(idea[1:])
    answer = 0
    letters = sorted(groups)
    for i in range(len(letters)):
        for j in range(i + 1, len(letters)):
            a = groups[letters[i]]
            b = groups[letters[j]]
            only_a = len(a - b)
            only_b = len(b - a)
            answer += 2 * only_a * only_b
    return answer
`
