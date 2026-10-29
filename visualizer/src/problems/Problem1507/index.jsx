import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, pythonLineMap } from './algorithm'

const definition = {
  phases: [
    { id: 'init', label: 'Months', description: 'Load the month abbreviations.' },
    { id: 'split', label: 'Split', description: 'Split the date into day, month and year.' },
    { id: 'day', label: 'Day', description: 'Remove the ordinal suffix and pad the day.' },
    { id: 'month', label: 'Month', description: 'Convert the month abbreviation to a number.' },
    { id: 'done', label: 'Result', description: 'Assemble YYYY-MM-DD.' },
  ],
  parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Date (JSON object with date, e.g. {"date":"20th Oct 2052"})',
  url: 'https://leetcode.com/problems/reformat-date/',
  complexity: 'O(1) time and O(1) space because the date has three fixed parts.',
  examples: [
    { label: 'Oct 20', input: '{"date":"20th Oct 2052"}' },
    { label: 'Jun 6', input: '{"date":"6th Jun 1933"}' },
    { label: 'May 26', input: '{"date":"26th May 1960"}' },
  ],
}

export default function ReformatDate() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Date parts" length={step.tokens.length} valueAt={i => step.tokens[i]} active={step.active}
      roleAt={i => (step.phase === 'done' || i < step.active ? 'read' : '')} />
    <p>Output: {step.result ?? '…'}</p>
  </>} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
