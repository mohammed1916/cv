const MAX_WORDS = 6
const MAX_LENGTH = 6

function parseWords(list, label) {
  if (!Array.isArray(list) || list.length < 1 || list.length > MAX_WORDS) throw new Error(`${label} has 1 to ${MAX_WORDS} words.`)
  if (list.some(w => typeof w !== 'string' || !/^[a-z]{1,6}$/.test(w))) throw new Error(`Each word is 1 to ${MAX_LENGTH} lowercase letters.`)
  return list
}

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object') throw new Error('Use an object like {"words_container":["abcd"],"words_query":["cd"]}.')
  return { words_container: parseWords(data.words_container, 'words_container'), words_query: parseWords(data.words_query, 'words_query') }
}

export function buildTrace({ words_container, words_query }) {
  const root = { next: new Map(), best: null }
  const better = (index, current) => current === null || words_container[index].length < words_container[current].length
  const frames = [{ pythonLine: 4, phase: 'start', activeLine: L('const root = { next'), word: null, best: null, answers: [], message: 'Start with an empty reversed-word trie.' }]
  words_container.forEach((w, index) => {
    if (better(index, root.best)) root.best = index
    let node = root
    for (const ch of [...w].reverse()) {
      if (!node.next.has(ch)) node.next.set(ch, { next: new Map(), best: null })
      node = node.next.get(ch)
      if (better(index, node.best)) node.best = index
    }
    frames.push({ pythonLine: 12, phase: 'build', activeLine: L('for (const ch of [...w].reverse())'), word: w, best: root.best, answers: [], message: `Stored ${w} (index ${index}) along its reversed path.` })
  })
  const answers = []
  for (const q of words_query) {
    let node = root
    for (const ch of [...q].reverse()) {
      if (!node.next.has(ch)) break
      node = node.next.get(ch)
    }
    answers.push(node.best)
    frames.push({ pythonLine: 20, phase: 'query', activeLine: L('answers.push(node.best)'), word: q, best: node.best, answers: [...answers], message: `${q} matches its best container word at index ${node.best}.` })
  }
  frames.push({ pythonLine: 21, phase: 'done', activeLine: L('return answers'), word: null, best: null, answers: [...answers], message: `Answers: ${answers.join(', ')}.` })
  return { input: { words_container, words_query }, result: answers, frames }
}

export const code = `function longestCommonSuffixQueries(wordsContainer, wordsQuery) {
  const root = { next: new Map(), best: null }
  const better = (index, current) => current === null || wordsContainer[index].length < wordsContainer[current].length
  wordsContainer.forEach((w, index) => {
    if (better(index, root.best)) root.best = index
    let node = root
    for (const ch of [...w].reverse()) {
      if (!node.next.has(ch)) node.next.set(ch, { next: new Map(), best: null })
      node = node.next.get(ch)
      if (better(index, node.best)) node.best = index
    }
  })
  const answers = []
  for (const q of wordsQuery) {
    let node = root
    for (const ch of [...q].reverse()) {
      if (!node.next.has(ch)) break
      node = node.next.get(ch)
    }
    answers.push(node.best)
  }
  return answers
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_common_suffix_queries(words_container, words_query):
    def better(index, current):
        return current is None or len(words_container[index]) < len(words_container[current])
    root = {'best': None}
    for index, word in enumerate(words_container):
        if better(index, root['best']):
            root['best'] = index
        node = root
        for ch in reversed(word):
            node = node.setdefault(ch, {'best': None})
            if better(index, node['best']):
                node['best'] = index
    answers = []
    for query in words_query:
        node = root
        for ch in reversed(query):
            if ch not in node:
                break
            node = node[ch]
        answers.append(node['best'])
    return answers
`
