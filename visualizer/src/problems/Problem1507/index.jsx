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
  inputLabel: 'Date (JSON object with date, e.g. {"date":"11th Mar 1987"})',
  url: 'https://leetcode.com/problems/reformat-date/',
  complexity: 'O(1) time and O(1) space because the date has three fixed parts.',
  examples: [
    { label: 'Mar 11 (teen ordinal)', input: '{"date":"11th Mar 1987"}' },
    { label: 'Sep 23 (rd ordinal)', input: '{"date":"23rd Sep 2041"}' },
    { label: 'Dec 1 (st ordinal)', input: '{"date":"1st Dec 1999"}' },
    { label: 'First day of 1900', input: '{"date":"1st Jan 1900"}' },
    { label: 'Leap day', input: '{"date":"29th Feb 2000"}' },
    { label: 'Teen ordinal late', input: '{"date":"21st Jun 2024"}' },
    { label: 'Last year allowed', input: '{"date":"31st Dec 2100"}' },
  ],
}

export default function ReformatDate() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Date parts" length={step.tokens.length} valueAt={i => step.tokens[i]} active={step.active}
      roleAt={i => (step.phase === 'done' || i < step.active ? 'read' : '')} />
    <p>Output: {step.result ?? '…'}</p>
  </>} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
