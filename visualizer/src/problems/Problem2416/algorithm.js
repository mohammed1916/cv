const MAX_WORDS = 6
const MAX_LENGTH = 6

const CODE = [
  'function sumPrefixScores(words) {',
  '  const trie = [{ char: "", children: new Map(), pass: 0, terminal: 0 }]',
  '  for (const word of words) {',
  '    let node = 0',
  '    for (const ch of word) {',
  '      if (!trie[node].children.has(ch)) {',
  '        trie.push({ char: ch, children: new Map(), pass: 0, terminal: 0 })',
  '        trie[node].children.set(ch, trie.length - 1)',
  '      }',
  '      node = trie[node].children.get(ch)',
  '      trie[node].pass += 1',
  '    }',
  '    trie[node].terminal += 1',
  '  }',
  '  return words.map(word => {',
  '    let node = 0',
  '    let score = 0',
  '    for (const ch of word) {',
  '      node = trie[node].children.get(ch)',
  '      score += trie[node].pass',
  '    }',
  '    return score',
  '  })',
  '}',
]

const PY = [
  'def sum_prefix_scores(words):',
  '    trie = [{"children": {}, "pass": 0, "terminal": 0}]',
  '    for word in words:',
  '        node = 0',
  '        for ch in word:',
  '            if ch not in trie[node]["children"]:',
  '                trie.append({"children": {}, "pass": 0, "terminal": 0})',
  '                trie[node]["children"][ch] = len(trie) - 1',
  '            node = trie[node]["children"][ch]',
  '            trie[node]["pass"] += 1',
  '        trie[node]["terminal"] += 1',
  '    answer = []',
  '    for word in words:',
  '        node = 0',
  '        score = 0',
  '        for ch in word:',
  '            node = trie[node]["children"][ch]',
  '            score += trie[node]["pass"]',
  '        answer.append(score)',
  '    return answer',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.includes(text.trim()))
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}
const codeLine = text => at(CODE, text)
const pyLine = text => at(PY, text)

export const phases = [
  { id: 'start', label: 'Empty trie', description: 'Start with only the root.' },
  { id: 'insert', label: 'Insert', description: 'Walk each word, creating nodes and counting every visit.' },
  { id: 'score', label: 'Score', description: 'Walk each word again and add the pass count of every prefix node.' },
  { id: 'done', label: 'Complete', description: 'Report every word score.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.words)) throw new Error('Use an object like {"words":["abc","ab"]}.')
  if (data.words.length < 1 || data.words.length > MAX_WORDS) throw new Error(`Use 1 to ${MAX_WORDS} words.`)
  if (data.words.some(w => typeof w !== 'string' || !/^[a-z]{1,6}$/.test(w))) throw new Error(`Each word is 1 to ${MAX_LENGTH} lowercase letters.`)
  return { words: data.words }
}

export function buildTrace({ words }) {
  // Trie nodes: index 0 is the root. Each node keeps its character, parent, pass count and end count.
  const trie = [{ char: '', parent: null, prefix: '', children: new Map(), pass: 0, terminal: 0 }]
  const snapshot = () => trie.map((node, id) => ({ id, parent: node.parent, char: node.char, prefix: node.prefix, pass: node.pass, terminal: node.terminal }))
  const frames = [{ phase: 'start', pythonLine: pyLine('trie = [{'), activeLine: codeLine('const trie = ['), nodes: snapshot(), activeNode: 0, word: null, answer: [], score: null, message: 'Start with only the root. Every prefix will get its own node.' }]
  for (const word of words) {
    let node = 0
    for (const ch of word) {
      if (!trie[node].children.has(ch)) {
        trie.push({ char: ch, parent: node, prefix: trie[node].prefix + ch, children: new Map(), pass: 0, terminal: 0 })
        trie[node].children.set(ch, trie.length - 1)
      }
      node = trie[node].children.get(ch)
      trie[node].pass += 1
      frames.push({ phase: 'insert', pythonLine: pyLine('trie[node]["pass"] += 1'), activeLine: codeLine('trie[node].pass += 1'), nodes: snapshot(), activeNode: node, word, answer: [], score: null, message: `${word}: the node for "${trie[node].prefix}" now counts ${trie[node].pass} word${trie[node].pass === 1 ? '' : 's'}.` })
    }
    trie[node].terminal += 1
  }
  const answer = []
  for (const word of words) {
    let node = 0
    let score = 0
    for (const ch of word) {
      node = trie[node].children.get(ch)
      score += trie[node].pass
      frames.push({ phase: 'score', pythonLine: pyLine('score += trie[node]["pass"]'), activeLine: codeLine('score += trie[node].pass'), nodes: snapshot(), activeNode: node, word, answer: [...answer], score, message: `Prefix "${trie[node].prefix}" is shared by ${trie[node].pass} word${trie[node].pass === 1 ? '' : 's'}. Score so far ${score}.` })
    }
    answer.push(score)
  }
  frames.push({ phase: 'done', pythonLine: pyLine('return answer'), activeLine: codeLine('return words.map'), nodes: snapshot(), activeNode: null, word: null, answer: [...answer], score: null, message: `Scores: ${answer.join(', ')}.` })
  return { input: { words }, result: answer, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
