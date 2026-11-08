import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'build', label: 'Index words', description: 'Each word is stored under every one-letter wildcard pattern.' },
    { id: 'probe', label: 'Probe a pattern', description: 'Wildcard one letter of the query and look for a different stored word.' },
    { id: 'answer', label: 'Answer query', description: 'A different stored word means exactly one letter can be changed.' },
    { id: 'done', label: 'Results', description: 'One boolean per query.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Words and queries (JSON object)',
  url: 'https://leetcode.com/problems/implement-magic-dictionary/',
  complexity: 'Building costs O(total letters) for the words; each query costs O(length²) in the worst case using set membership per pattern.',
  examples: [
    { label: 'One change', input: '{"words":["cart","dog"],"queries":["card","cart","dig"]}' },
    { label: 'Near words', input: '{"words":["tea","team"],"queries":["teem","tead","team"]}' },
    { label: 'Swapped letters', input: '{"words":["ab"],"queries":["ac","ba"]}' },
    { label: 'One letter words', input: '{"words":["a"],"queries":["b"]}' },
    { label: 'Identical word is not a change', input: '{"words":["hello"],"queries":["hello"]}' },
    { label: 'Longest words', input: '{"words":["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"],"queries":["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab"]}' },
    { label: 'Long run: 100 words and queries', input: '{"words":["c","dbb","a","dcec","ae","dece","a","ceb","adebc","b","eecba","ba","ccdac","cecd","dc","dae","ba","aed","ee","daa","caeed","cdda","ab","e","d","eeead","bac","ede","dec","bd","aeeb","bbaed","aadaa","dde","edadb","dd","ccdea","bba","bbeaa","caeae","eab","ccec","acda","b","ddacd","d","b","cedd","ddcda","bcdcc","eaeaa","eddaa","e","ab","dedc","caa","bd","beee","beede","ddcb","cb","ddc","eb","d","abbdd","ad","ecc","bdace","bb","daa","d","e","dcc","e","bed","da","adb","ca","bc","eaeda","abc","b","a","bbbe","ceae","aeba","c","eed","eadab","bbc","dbac","e","ecdc","eebc","aca","cdbb","e","ceb","db","da"],"queries":["eac","bd","b","a","e","e","acb","cebbe","dddbd","aeaac","c","a","cbb","dcc","d","c","c","abbeb","ad","a","eb","a","bdaae","a","a","ccee","ad","beb","b","ab","e","ecedd","bad","c","deced","acc","ba","bcb","ba","dd","eedde","cba","adcd","dbccd","bec","c","dca","adcdd","bc","deeb","c","ed","dbdde","ce","dabb","abeed","cabcb","ece","db","cad","ee","cbdea","cdec","ebe","b","cd","ed","ded","dac","ade","ead","ac","ac","e","adc","decbe","beadb","ccca","aacad","db","ebce","baabe","c","eb","cdce","aaeb","de","eda","ceb","dbd","dcae","eebab","ad","b","dede","dabc","bc","c","db","bda"]}' },
  ],
}

export default function MagicDictionary() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RecordStateTable label={step.query ? `Query ${step.query}: wildcard pattern` : 'Query'} columns={['pattern', 'stored words', 'result']}
      rows={step.pattern ? [{ pattern: step.pattern, 'stored words': step.bucket.join(', ') || 'none', result: step.matched ? 'match' : 'no match' }] : []} />
    <RecordStateTable label="Answers so far" columns={['query', 'answer']}
      rows={run.input.queries.slice(0, step.results.length).map((query, i) => ({ query, answer: String(step.results[i]) }))} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why wildcards:</strong> two words differ in exactly one letter exactly when they share a pattern with one position wildcarded, so one lookup per position is enough.</p>
  </>} />
}
