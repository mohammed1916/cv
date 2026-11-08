import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm'

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases,
  inputLabel: 'Words and letters (JSON object)',
  url: 'https://leetcode.com/problems/stream-of-characters/',
  complexity: 'Building costs O(total word length). Each query walks at most the longest stored word.',
  examples: [
    { label: 'Suffix match', input: '{"words":["ab","cd","bcd"],"letters":"xabcd"}' },
    { label: 'Repeats', input: '{"words":["a","aa"],"letters":"baa"}' },
    { label: 'Single word, single letter', input: '{"words":["a"],"letters":"a"}' },
    { label: 'Overlapping matches', input: '{"words":["aa"],"letters":"aaaa"}' },
    { label: 'No match at all', input: '{"words":["xyz"],"letters":"abcab"}' },
    { label: 'Largest input: 20 words, 40 letters', input: '{"words":["euszddoz","upozpodb","crkaagal","tmgalqym","bobbwbvo","rjxbitsy","aetkbdia","qgpkmofk","ybklygcm","pdgljqzo","xycmubxy","nbxmftmz","wvtnzdjb","mypvkohl","uslwvgen","cvgwhqtx","tqcxsbrz","bsyxdtob","rnuyodlk","aqpyiojm"],"letters":"ybklygcmpkgkkokupghxzttnohispgemiuxiiupv"}' },
    { label: 'Long run: 20 mixed-length words', input: '{"words":["ep","u","dmfewyxc","thbnhqm","bkw","se","ahoox","q","zefpu","pzb","xb","owtzklir","wyozv","mtkagnv","uwgar","lqc","ttx","jntk","sqpk","il"],"letters":"pdgljqzoxkkzcdujqaayndyrppzuuiboeybjobup"}' },
  ],
}

function StreamChecker() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const s = step.snapshot
    const hist = s.history ?? ''
    return <>
      <IndexedSequence label="Stream history" length={hist.length} valueAt={k => hist[k]} active={hist.length - 1}
        roleAt={k => (s.walk && k === hist.length - s.walk.length ? 'walk start' : '')} />
      <p>Stream so far: <strong>{s.history || '(empty)'}</strong></p>
      <p>Walk from the newest letter backwards: <strong>{s.walk || '—'}</strong>{s.hit === true ? ' · word found' : ''}</p>
      <section aria-label="Reversed trie">
        <p>Reversed trie of the stored words. The highlighted path is the walk so far, read from the newest letter.</p>
        <TrieTree tree={s.tree} path="" walk={s.walk ?? ''} />
      </section>
      <p>Answers: {s.answers.length ? s.answers.map(a => a ? 'true' : 'false').join(', ') : 'none yet'}</p>
    </>
  }} renderReasoning={() => <>
    <p>Reversing each word turns "ends with this word" into "starts from the newest letter". One trie walk per query therefore checks every word at once.</p>
    <p>The walk stops at the first missing edge, or at the first point where a stored word ends.</p>
  </>} />
}

function TrieTree({ tree, path, walk }) {
  const here = path === walk
  const onWalk = walk.startsWith(path)
  return <ul style={{ listStyle: 'none', margin: 0, paddingLeft: path === '' ? 0 : 18, fontFamily: 'monospace' }}>
    <li>
      <span style={{ padding: '1px 6px', border: here ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: 4, background: onWalk && path !== '' ? 'var(--surface2)' : 'transparent', color: 'var(--text)' }}>
        {path === '' ? 'root' : path[path.length - 1]}{tree.end ? ' (word end)' : ''}
      </span>
      {tree.kids.map(kid => <TrieTree key={kid.label} tree={kid} path={path + kid.label} walk={walk} />)}
    </li>
  </ul>
}

export default withProblemStory(StreamChecker, storyGuide);
