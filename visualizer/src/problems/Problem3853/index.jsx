import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Start', description: 'Begin with the original string.' },
    { id: 'pair', label: 'Pair', description: 'Find the close pair to merge.' },
    { id: 'merge', label: 'Merge', description: 'Delete the right character.' },
    { id: 'done', label: 'Result', description: 'Return the string with no close pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s and k',
  url: 'https://leetcode.com/problems/merge-close-characters/',
  complexity: 'Each merge shortens the string, and each search scans the pairs again. The visual caps the string at 16 letters.',
  examples: [
    { label: 'Example', input: '{"s":"mnmpnm","k":2}' },
    { label: 'Run of a', input: '{"s":"aaa","k":1}' },
  ],
}

export default function MergeCloseCharacters() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const [l, r] = step.pair ?? [-1, -1]
    return <>
      <IndexedSequence label={`Current string (k = ${run.input.k}; l is the left letter, r the right one that merges)`} length={[...step.cur].length}
        active={r} valueAt={index => step.cur[index]} roleAt={index => index === l ? 'l' : index === r ? `r, ${r - l} apart` : ''} />
      <output aria-label="Merge status">{step.pair ? `Pair ${l} and ${r} is close: distance ${r - l} is at most ${run.input.k}` : step.cur}</output>
    </>
  }} renderReasoning={() => <>
    <p>Two equal letters merge when their indices are at most k apart. The right one is removed, and the indices after it shift left.</p>
    <p>Each search takes the smallest left index first, then the smallest right index, so the order of merges is fixed.</p>
  </>} />
}
