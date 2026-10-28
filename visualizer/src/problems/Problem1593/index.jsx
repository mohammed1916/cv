import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no pieces and a best count of zero.' },
    { id: 'choose', label: 'Take piece', description: 'Add a new unused piece and split the rest.' },
    { id: 'duplicate', label: 'Duplicate', description: 'This piece is already used, so skip it.' },
    { id: 'record', label: 'Record', description: 'The text is fully split, so compare the count with the best.' },
    { id: 'backtrack', label: 'Backtrack', description: 'Remove the piece and try a longer one.' },
    { id: 'done', label: 'Complete', description: 'Report the maximum number of unique pieces.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a lowercase string s (JSON)',
  url: 'https://leetcode.com/problems/split-a-string-into-the-max-number-of-unique-substrings/',
  complexity: 'Exponential in the length of s in the worst case. The visualization caps s at 12 characters.',
  examples: [
    { label: 'Example 1', input: '{"s":"ababccc"}' },
    { label: 'Example 2', input: '{"s":"aba"}' },
  ],
}

export default function UniqueSplit() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const inPiece = index => step.piece !== null && index >= step.start && index < step.end
    return <>
      <IndexedSequence label="Text" length={run.input.s.length} active={step.start < run.input.s.length ? step.start : -1}
        valueAt={index => run.input.s[index]}
        roleAt={index => (inPiece(index) ? 'piece' : '')} />
      <output aria-label="Pieces">{`Pieces: ${step.pieces.join(' | ') || '(none)'} · best ${step.best}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Every cut position is a choice, so the search tries each split and backtracks when a piece repeats.</p>
    <p>A split is recorded only when the text is fully consumed, and the largest count among recorded splits is the answer.</p>
  </>} />
}
