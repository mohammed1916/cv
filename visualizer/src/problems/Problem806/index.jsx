import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Line 1', description: 'The first line is empty.' },
    { id: 'fit', label: 'Fits', description: 'The letter is added to the current line.' },
    { id: 'wrap', label: 'Wrap', description: 'The letter starts a new line.' },
    { id: 'done', label: 'Complete', description: 'Return the line count and the last width.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'widths (26 integers) and s (JSON object)',
  url: 'https://leetcode.com/problems/number-of-lines-to-write-string/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Two lines', input: '{"widths":[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],"s":"abcdefghijklmnopqrstuvwxyz"}' },
    { label: 'Mixed widths', input: '{"widths":[10,3,7,10,2,5,6,8,9,10,4,2,3,6,7,8,9,10,2,3,4,5,6,7,8,9],"s":"zyxwvut"}' }, { label: 'Single letter', input: '{"widths":[10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10],"s":"a"}' }, { label: 'Exact fill: ten lines', input: '{"widths":[10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10],"s":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}' }, { label: 'Long run: 100 letters, mixed widths', input: '{"widths":[7,6,5,6,7,2,8,2,2,8,10,5,6,5,5,10,6,5,8,5,9,2,2,10,7,5],"s":"tmnmfuxlelasnaevckbhqbqjjsoepflrsebzclxlpoanqnublxnyfuiarkcibezhxljpllhmsnovrpflezzmszdwopqwmbuvyynp"}' },
  ],
}

export default function NumberOfLines() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Text s" length={run.input.s.length} valueAt={k => run.input.s[k]} active={step.i ?? -1} />
    <RecordStateTable label="Letters placed so far" columns={['letter', 'width', 'line', 'used on line']}
      rows={step.rows.map(r => ({ letter: r.letter, width: r.w, line: r.line, 'used on line': r.used }))}
      activeRow={step.rows.length - 1} />
    <output aria-label="Step">{`Lines: ${step.lines}. ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>A letter is placed on the current line when its width still fits within 100 pixels; otherwise a new line starts with that letter.</p>
    <p>The answer is the number of lines and the pixels used on the last one.</p>
  </>} />
}
