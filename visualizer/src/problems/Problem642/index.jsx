import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import TrieStateDiagram from '../../components/shared/TrieStateDiagram'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Load history', description: 'Store every sentence with its hotness.' },
    { id: 'input', label: 'Type a character', description: 'Extend the prefix and rank the matching sentences.' },
    { id: 'save', label: 'Save with #', description: 'The typed sentence gains one count and the prefix resets.' },
    { id: 'done', label: 'Complete', description: 'Report the suggestions after each character.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Sentences, hotness and typed text (JSON)',
  url: 'https://leetcode.com/problems/design-search-autocomplete-system/',
  complexity: 'Each character scans the stored sentences. The visualization caps input at 10 sentences and 40 characters.',
  examples: [
    { label: 'Example 1', input: '{"sentences":["i love you","island","ironman","i love leetcode"],"times":[5,3,2,2],"typed":"i a#"}' },
    { label: 'Saving', input: '{"sentences":["abc","abd"],"times":[1,1],"typed":"abd#ab"}' },
    { label: 'One sentence', input: '{"sentences":["a"],"times":[1],"typed":"a#"}' },
    { label: 'Equal hotness sorted by text', input: '{"sentences":["ac","aa","ab"],"times":[2,2,2],"typed":"a"}' },
    { label: 'Largest counts and typed text', input: '{"sentences":["zzz","zz","z","zzzz","zzzzz","zz z","z z","zz zz","zzz z","z zz"],"times":[100,100,100,100,100,100,100,100,100,100],"typed":"zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz#"}' },
    { label: 'Empty save gives nothing', input: '{"sentences":["ab"],"times":[4],"typed":"#"}' },
    { label: 'Long run: forty typed characters', input: '{"sentences":["baa","bbbba","bbbab","babbbaa","abbabaa","bba","aaaab","aaaaabbb","bbbbb","baaaa"],"times":[98,62,94,69,5,63,95,68,9,73],"typed":"## a aba##b#ab# #  ba b aabaaaaba#a# #b#"}' },
  ],
}

// Prefix tree of the stored sentences. Each node id is its prefix; terminal nodes show the stored count.
function buildPrefixTree(sentences, times) {
  const nodes = [{ id: '', parent: null, char: '', prefix: '', terminal: null }]
  const byId = new Map([['', nodes[0]]])
  sentences.forEach((sentence, k) => {
    let id = ''
    for (const ch of sentence) {
      const next = id + ch
      if (!byId.has(next)) {
        const node = { id: next, parent: id, char: ch === ' ' ? '␣' : ch, prefix: next, terminal: null }
        byId.set(next, node)
        nodes.push(node)
      }
      id = next
    }
    byId.get(id).terminal = String(times[k])
  })
  return { nodes, byId }
}

export default function DesignAutocomplete() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nodes, byId } = buildPrefixTree(run.input.sentences, run.input.times)
    let active = step.phase === 'save' ? '' : step.typed
    while (active && !byId.has(active)) active = active.slice(0, -1)
    return <>
      <p aria-label="Typed so far">Prefix: <code>{step.typed || '(empty)'}</code></p>
      <TrieStateDiagram nodes={nodes} activeNode={active} />
      <IndexedSequence label="Suggestions (hottest first)" length={step.top.length} valueAt={i => `${step.top[i][0]} (${step.top[i][1]})`} />
    </>
  }} renderReasoning={() => <>
    <p>A trie or a scan can both find the sentences that start with the typed prefix. The ranking is by hotness, then by ASCII order, and only the top three are shown.</p>
    <p>A # records the typed sentence. It is the only operation that changes the counts, so later prefixes see the new hotness.</p>
  </>} />
}
