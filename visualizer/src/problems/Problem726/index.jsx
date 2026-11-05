import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Outer level', description: 'Counts for the whole formula.' },
    { id: 'open', label: 'Open group', description: 'Start counting a parenthesised group.' },
    { id: 'atom', label: 'Atom', description: 'Add the element with its count.' },
    { id: 'close', label: 'Close group', description: 'Multiply the group and add it to its parent.' },
    { id: 'done', label: 'Complete', description: 'Print atoms in sorted order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Formula (JSON string)',
  url: 'https://leetcode.com/problems/number-of-atoms/',
  complexity: 'O(n) time for the scan and O(n) space for the stack of levels.',
  examples: [
    { label: 'Ethanol', input: '"C2H5OH"' },
    { label: 'Iron cyclo', input: '"Fe(C5H5)2"' },
    { label: 'Alum', input: '"Al2(SO4)3"' },
  ],
}

export default function NumberOfAtoms() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <RecordStateTable label="Count levels (top of stack is the last row)" columns={['level', 'atoms']}
      rows={step.levels.map((atoms, level) => ({ level, atoms }))} activeRow={step.levels.length - 1} />
    <output aria-label="Current step">{`Position ${step.position}: ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>An opening parenthesis starts a new count level. A closing one multiplies that level by the number after it and adds the totals to the level below.</p>
    <p>Element names are an uppercase letter followed by lowercase letters. A missing number means 1.</p>
  </>} />
}
