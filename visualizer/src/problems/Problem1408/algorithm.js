export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with an empty answer list and the first word.' },
  { id: 'compare', label: 'Compare words', description: 'Check whether the current word appears inside a different word from the list.' },
  { id: 'found', label: 'Record match', description: 'The current word is inside another word, so it joins the answer once.' },
  { id: 'done', label: 'Complete', description: 'Return the words that matched, in the order they appear in the input.' },
]

export function parseInput(text) {
  const words = JSON.parse(text)
  if (!Array.isArray(words) || words.length < 1 || words.length > 10
    || !words.every(w => typeof w === 'string' && /^[a-z]{1,12}$/.test(w))
    || new Set(words).size !== words.length) {
    throw new Error('Use a JSON array of 1 to 10 distinct lowercase words of up to 12 letters, such as ["mass", "as", "hero"].')
  }
  return words
}

export function buildTrace(words) {
  const answer = []
  const snap = (i, j, extra = {}) => ({ words, i, j, answer: [...answer], ...extra })
  const frames = [{
    phase: 'start', activeLine: L('answer = empty'), pythonLine: PY('answer = []'), snapshot: snap(null, null),
    message: `${words.length} distinct words. A word qualifies when it sits inside a different word, so each word is compared only with the others.`,
  }]
  for (let i = 0; i < words.length; i++) {
    for (let j = 0; j < words.length; j++) {
      if (i === j) continue
      const inside = words[j].includes(words[i])
      frames.push({
        phase: 'compare', activeLine: L('not the same entry'), pythonLine: PY('if i != j'), snapshot: snap(i, j, { inside }),
        message: `Is "${words[i]}" inside "${words[j]}"? ${inside ? 'Yes.' : 'No.'}`,
      })
      if (inside) {
        answer.push(words[i])
        frames.push({
          phase: 'found', activeLine: L('append word'), pythonLine: PY('answer.append'), snapshot: snap(i, j, { inside }),
          message: `"${words[i]}" is a substring of "${words[j]}", so it is recorded. Later words for "${words[i]}" are not needed.`,
        })
        break
      }
    }
  }
  frames.push({
    phase: 'done', activeLine: L('return answer'), pythonLine: PY('return answer'), snapshot: snap(null, null),
    message: `Answer: [${answer.map(w => `"${w}"`).join(', ')}].`,
  })
  return { input: words, result: answer, frames }
}

export const code = `string matching (words):
  answer = empty list
  for each word in words:
    for each other word in words, not the same entry:
      if word is a substring of other:
        append word to answer, then move to the next word
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def string_matching(words):
    answer = []
    for i, word in enumerate(words):
        for j, other in enumerate(words):
            if i != j and word in other:
                answer.append(word)
                break
    return answer
`
const PY = s => python.split('\n').findIndex(l => l.includes(s)) + 1
