// LeetCode 1258: Synonymous Sentences. Join synonym pairs into groups with union-find. Each word
// may be replaced by any member of its group, so the sentences are every combination of one
// option per word. Collect the distinct results and sort them.
const MAX_WORDS = 8
const MAX_SENTENCES = 64

export const phases = [
  { id: 'setup', label: 'Read', description: 'Read the pairs and the sentence.' },
  { id: 'group', label: 'Group', description: 'Join a synonym pair into one group.' },
  { id: 'options', label: 'Options', description: 'List each word’s choices.' },
  { id: 'choose', label: 'Choose', description: 'Pick one option for this position.' },
  { id: 'emit', label: 'Sentence', description: 'A full sentence is built.' },
  { id: 'done', label: 'Result', description: 'Report the sorted distinct sentences.' },
]

export const code = `FUNCTION synonymousSentences(synonyms, text)
    parent ← each word is its own group
    FOR each pair (a, b) in synonyms
        union(a, b)
    words ← split text on single spaces
    FOR each word, options ← every member of its group
    results ← empty set
    FUNCTION choose(index, chosen)
        IF index = length of words THEN add join(chosen) to results
        ELSE FOR each option in options[index]
            choose(index + 1, chosen + option)
    choose(0, empty list)
    RETURN results sorted ascending`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(entry => entry.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def synonymous_sentences(synonyms, text):
    parent = {}

    def find(x):
        parent.setdefault(x, x)
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for a, b in synonyms:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[max(ra, rb)] = min(ra, rb)
    words = text.split(" ")
    options = []
    for w in words:
        root = find(w)
        members = {x for x in list(parent) if find(x) == root} | {w}
        options.append(sorted(members))
    results = set()

    def choose(index, chosen):
        if index == len(words):
            results.add(" ".join(chosen))
            return
        for option in options[index]:
            chosen.append(option)
            choose(index + 1, chosen)
            chosen.pop()

    choose(0, [])
    return sorted(results)


if __name__ == "__main__":
    import sys, json
    data = json.loads(sys.stdin.read())
    print(json.dumps(synonymous_sentences(data["synonyms"], data["text"])))
`

const PYTHON_LINES = python.split('\n')
const P = s => {
  const index = PYTHON_LINES.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

// Groups as sorted arrays, keyed by their smallest member for a stable display.
// Union-find over words: the larger root points at the smaller, so each group has a stable root.
function find(parent, x) {
  if (!parent.has(x)) parent.set(x, x)
  while (parent.get(x) !== x) x = parent.get(x)
  return x
}

function unite(parent, a, b) {
  const ra = find(parent, a)
  const rb = find(parent, b)
  if (ra !== rb) parent.set(ra < rb ? rb : ra, ra < rb ? ra : rb)
}

function groupsOf(parent) {
  const groups = new Map()
  for (const word of parent.keys()) {
    const root = find(parent, word)
    if (!groups.has(root)) groups.set(root, [])
    groups.get(root).push(word)
  }
  return [...groups.values()].filter(g => g.length > 1).map(g => g.sort()).sort((a, b) => (a[0] < b[0] ? -1 : 1))
}

function optionsFor(text, parent) {
  const groups = groupsOf(parent)
  return text.split(' ').map(word => {
    const group = groups.find(g => g.includes(word))
    return group ? [...group] : [word]
  })
}

export function parseInput(text) {
  const input = typeof text === 'string' ? JSON.parse(text) : text
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with synonyms and text.')
  const { synonyms, text: sentence } = input
  if (!Array.isArray(synonyms) || synonyms.length > 10) throw new Error('synonyms is a list of at most 10 pairs.')
  for (const pair of synonyms) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(w => typeof w === 'string' && /^\S+$/.test(w))) {
      throw new Error('Each synonym pair is two words with no spaces.')
    }
  }
  if (typeof sentence !== 'string' || !/^\S+( \S+)*$/.test(sentence)) throw new Error('text is words separated by single spaces.')
  const words = sentence.split(' ')
  if (words.length > MAX_WORDS) throw new Error(`The visualization caps the sentence at ${MAX_WORDS} words.`)
  const parent = new Map()
  for (const [a, b] of synonyms) unite(parent, a, b)
  const product = optionsFor(sentence, parent).reduce((acc, list) => acc * list.length, 1)
  if (product > MAX_SENTENCES) throw new Error(`The visualization caps the combinations at ${MAX_SENTENCES}.`)
  return { synonyms, text: sentence }
}

export function buildTrace({ synonyms, text }) {
  const frames = []
  const words = text.split(' ')
  const parent = new Map()
  const emit = (phase, codeText, pyText, message, extra = {}) => frames.push({
    phase, activeLine: L(codeText), pythonLine: P(pyText), message,
    groups: groupsOf(parent), options: [], depth: -1, chosen: [], optionIndex: -1, emitted: [], result: null, ...extra,
  })
  emit('setup', 'parent ← each word is its own group', 'parent = {}', `${synonyms.length} synonym pair${synonyms.length === 1 ? '' : 's'} and ${words.length} word${words.length === 1 ? '' : 's'}.`)
  for (const [a, b] of synonyms) {
    unite(parent, a, b)
    emit('group', 'union(a, b)', 'ra, rb = find(a), find(b)', `${a} and ${b} now share a group.`)
  }
  const options = optionsFor(text, parent)
  emit('options', 'FOR each word, options ← every member of its group', 'options.append(sorted(members))', `Options per word: ${options.map(list => `{${list.join(', ')}}`).join(' ')}.`, { options })
  const results = new Set()
  const chosen = []
  function choose(index) {
    if (index === words.length) {
      const sentence = chosen.join(' ')
      results.add(sentence)
      emit('emit', 'IF index = length of words THEN add join(chosen) to results', 'results.add(" ".join(chosen))', `Sentence built: "${sentence}".`, { options, depth: index, chosen: chosen.slice(), emitted: [...results] })
      return
    }
    for (const option of options[index]) {
      chosen.push(option)
      emit('choose', 'FOR each option in options[index]', 'for option in options[index]', `Position ${index} takes ${option}.`, { options, depth: index, chosen: chosen.slice(), optionIndex: options[index].indexOf(option), emitted: [...results] })
      choose(index + 1)
      chosen.pop()
    }
  }
  choose(0)
  const sorted = [...results].sort()
  emit('done', 'RETURN results sorted ascending', 'return sorted(results)', `${sorted.length} distinct sentence${sorted.length === 1 ? '' : 's'}.`, { options, emitted: sorted, result: sorted })
  return { input: { synonyms, text }, result: sorted, frames }
}
