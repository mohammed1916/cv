import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DisjointSetView from '../../components/shared/DisjointSetView'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Single words', description: 'Each word starts in its own group.' },
    { id: 'union', label: 'Pairs', description: 'Each pair merges the two groups.' },
    { id: 'match', label: 'Compare', description: 'Each position needs equal words or a shared group.' },
    { id: 'mismatch', label: 'Mismatch', description: 'This position has no chain of pairs.' },
    { id: 'done', label: 'Complete', description: 'Return the verdict.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'sentence1, sentence2 and pairs (JSON object)',
  url: 'https://leetcode.com/problems/sentence-similarity-ii/',
  complexity: 'O((n + p) * α) time with union-find, where p is the number of pairs.',
  examples: [
    { label: 'Chain', input: '{"sentence1":["cat","sees","fish"],"sentence2":["dog","notices","shark"],"pairs":[["cat","dog"],["sees","notices"],["fish","shark"]]}' },
    { label: 'Broken', input: '{"sentence1":["red","car"],"sentence2":["blue","car"],"pairs":[["red","green"]]}' },
    { label: 'Single equal word', input: '{"sentence1":["cat"],"sentence2":["cat"],"pairs":[]}' },
    { label: 'No pair, different words', input: '{"sentence1":["cat"],"sentence2":["dog"],"pairs":[]}' },
    { label: 'Transitive pairs', input: '{"sentence1":["x","y"],"sentence2":["x","z"],"pairs":[["y","w"],["w","z"]]}' },
    { label: 'Long run: 100 words', input: '{"sentence1":["acfd","afcfb","dcb","d","cbfc","adf","fbacc","bf","ffada","aabde","ec","fadbde","bfad","fecfe","da","fdf","f","eade","f","bd","beac","fb","aced","f","ad","f","dbae","beaad","dcbdd","abad","e","c","cfcdcf","e","ffdee","feac","ecfcf","ebdbcc","bfcea","a","d","faa","de","dfa","deeee","ebf","defcf","cebcfd","ea","a","ceeef","cedfb","dc","aafd","fdce","eefe","dccead","fccba","ff","fe","ca","bfd","dbb","aadbb","dccbef","a","b","b","bbcd","bdada","eedfd","ce","fcecab","aede","aa","eaedd","cbdb","dff","c","ddbca","f","cbd","beea","bdb","ffda","accdec","a","d","acdef","aa","aeff","fdaa","afaea","ba","cefe","cadaa","cdcdb","ad","dbd","bbfbea"],"sentence2":["acfdz","afcfbz","dcbz","dz","cbfcz","adfz","fbaccz","bfz","ffadaz","aabdez","ecz","fadbdez","bfadz","fecfez","daz","fdfz","fz","eadez","fz","bdz","beacz","fbz","acedz","fz","adz","fz","dbaez","beaadz","dcbddz","abadz","ez","cz","cfcdcfz","ez","ffdeez","feacz","ecfcfz","ebdbccz","bfceaz","az","dz","faaz","dez","dfaz","deeeez","ebfz","defcfz","cebcfdz","eaz","az","ceeefz","cedfbz","dcz","aafdz","fdcez","eefez","dcceadz","fccbaz","ffz","fez","caz","bfdz","dbbz","aadbbz","dccbefz","az","bz","bz","bbcdz","bdadaz","eedfdz","cez","fcecabz","aedez","aaz","eaeddz","cbdbz","dffz","cz","ddbcaz","fz","cbdz","beeaz","bdbz","ffdaz","accdecz","az","dz","acdefz","aaz","aeffz","fdaaz","afaeaz","baz","cefez","cadaaz","cdcdbz","adz","dbdz","bbfbeaz"],"pairs":[["acfd","acfdz"],["afcfb","afcfbz"],["dcb","dcbz"],["d","dz"],["cbfc","cbfcz"],["adf","adfz"],["fbacc","fbaccz"],["bf","bfz"],["ffada","ffadaz"],["aabde","aabdez"],["ec","ecz"],["fadbde","fadbdez"],["bfad","bfadz"],["fecfe","fecfez"],["da","daz"],["fdf","fdfz"],["f","fz"],["eade","eadez"],["f","fz"],["bd","bdz"],["beac","beacz"],["fb","fbz"],["aced","acedz"],["f","fz"],["ad","adz"],["f","fz"],["dbae","dbaez"],["beaad","beaadz"],["dcbdd","dcbddz"],["abad","abadz"],["e","ez"],["c","cz"],["cfcdcf","cfcdcfz"],["e","ez"],["ffdee","ffdeez"],["feac","feacz"],["ecfcf","ecfcfz"],["ebdbcc","ebdbccz"],["bfcea","bfceaz"],["a","az"],["d","dz"],["faa","faaz"],["de","dez"],["dfa","dfaz"],["deeee","deeeez"],["ebf","ebfz"],["defcf","defcfz"],["cebcfd","cebcfdz"],["ea","eaz"],["a","az"],["ceeef","ceeefz"],["cedfb","cedfbz"],["dc","dcz"],["aafd","aafdz"],["fdce","fdcez"],["eefe","eefez"],["dccead","dcceadz"],["fccba","fccbaz"],["ff","ffz"],["fe","fez"],["ca","caz"],["bfd","bfdz"],["dbb","dbbz"],["aadbb","aadbbz"],["dccbef","dccbefz"],["a","az"],["b","bz"],["b","bz"],["bbcd","bbcdz"],["bdada","bdadaz"],["eedfd","eedfdz"],["ce","cez"],["fcecab","fcecabz"],["aede","aedez"],["aa","aaz"],["eaedd","eaeddz"],["cbdb","cbdbz"],["dff","dffz"],["c","cz"],["ddbca","ddbcaz"],["f","fz"],["cbd","cbdz"],["beea","beeaz"],["bdb","bdbz"],["ffda","ffdaz"],["accdec","accdecz"],["a","az"],["d","dz"],["acdef","acdefz"],["aa","aaz"],["aeff","aeffz"],["fdaa","fdaaz"],["afaea","afaeaz"],["ba","baz"],["cefe","cefez"],["cadaa","cadaaz"],["cdcdb","cdcdbz"],["ad","adz"],["dbd","dbdz"],["bbfbea","bbfbeaz"]]}' },
  ],
}

export default function SentenceSimilarityII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DisjointSetView parent={step.parent} size={step.size} labels={run.labels} />
    {run.input.sentence1.length === run.input.sentence2.length && <RecordStateTable label="Sentence positions" columns={['position', 'word 1', 'word 2']}
      rows={run.input.sentence1.map((a, i) => ({ position: i, 'word 1': a, 'word 2': run.input.sentence2[i] }))} activeRow={step.i} />}
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Similarity is transitive through the pairs: if cat is like dog and dog is like pup, then cat is like pup. Union-find keeps those groups.</p>
    <p>After all pairs are merged, each position must hold equal words or two words in the same group.</p>
  </>} />
}
