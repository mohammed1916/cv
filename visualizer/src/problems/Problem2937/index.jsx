import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Shortest', description: 'The shared prefix cannot be longer than the shortest string.' },
    { id: 'match', label: 'Shared', description: 'All three strings hold the same letter here.' },
    { id: 'stop', label: 'Stop', description: 'The shared prefix ends at the first disagreement or the shortest end.' },
    { id: 'impossible', label: 'Impossible', description: 'No shared first letter means no meeting point.' },
    { id: 'done', label: 'Result', description: 'Count the letters that must be deleted.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s1, s2 and s3, each lowercase letters',
  url: 'https://leetcode.com/problems/make-three-strings-equal/',
  complexity: 'O(min length) time and O(1) extra space. The visualization caps each string at 20 letters.',
  examples: [
    { label: 'Shared start', input: '{"s1":"xyzab","s2":"xyzq","s3":"xyz"}' },
    { label: 'No shared start', input: '{"s1":"ab","s2":"cd","s3":"ef"}' },
  ],
}

export default function MakeThreeStringsEqual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s1" length={run.input.s1.length} valueAt={i => run.input.s1[i]} active={step.at >= 0 ? step.at : step.prefix - 1}
      roleAt={i => (i < step.prefix ? 'window' : '')} />
    <output aria-label="Shared prefix">{`shared prefix ${step.prefix}, result ${step.phase === 'done' || step.phase === 'impossible' ? run.result : 'pending'}`}</output>
  </>} renderReasoning={() => <>
    <p>Deleting only removes the last letter, so each string keeps a prefix of itself. All three strings can meet only on a prefix they already share.</p>
    <p>The best meeting point is the longest shared prefix, and every letter beyond it must be deleted.</p>
  </>} />
}
