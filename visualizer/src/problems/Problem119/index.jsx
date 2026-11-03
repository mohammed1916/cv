import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import IndexedSequence from '../../components/shared/IndexedSequence';
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm';

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases,
  inputLabel: 'Row index (integer from 0 to 30)',
  complexity: 'O(k²) time and O(k) extra space for row k, updating a single row in place.',
  examples: [
    { label: 'Row 0', input: '0' },
    { label: 'Row 3', input: '3' },
    { label: 'Row 4', input: '4' },
    { label: 'Row 10', input: '10' },
  ],
};

export default function PascalsTriangleIIVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.snapshot;
    return <>
      <IndexedSequence label={`Running row (level ${s.level})`} length={s.row.length} active={s.cell}
        valueAt={i => s.row[i]}
        roleAt={i => (step.phase === 'update' && i === s.cell ? 'updating' : '')} />
      <p>{step.phase === 'done' ? `Final row ${run.input}` : `Building row ${s.level}`}</p>
    </>;
  }} renderReasoning={() => <>
    <p>Each entry in row k is the sum of two entries in row k − 1. Overwriting one row in place works because updates go from right to left, so each left neighbour still holds the previous row.</p>
    <p>Each new row starts with a 1 and ends with a 1; the update pass fills in the middle values.</p>
  </>} />;
}
