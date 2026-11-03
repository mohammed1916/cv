import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code } from './algorithm'

const definition = {
  phases: [
    { id: 'create', label: 'Create', description: 'Wrap each array.' },
    { id: 'number', label: 'To number', description: 'Sum the values for numeric use.' },
    { id: 'add', label: 'Add', description: 'Combine the two numbers.' },
    { id: 'string', label: 'To string', description: 'Print in bracket form.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object with a and b (two integer lists)',
  url: 'https://leetcode.com/problems/array-wrapper/',
  complexity: 'O(length of each list) to sum, plus constant work for the conversions.',
  examples: [
    { label: 'Two wrappers', input: '{"a":[1,2],"b":[3]}' },
    { label: 'Negative values', input: '{"a":[],"b":[-4,1]}' },
  ],
}

export default function ArrayWrapper() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Conversion result" style={{ display: 'block', fontSize: 22, fontWeight: 700 }}>{step.shown ?? 'Two wrappers, not yet converted.'}</output>
    <p>Each wrapper converts on demand, so the same stored array can serve as a sum or as text.</p>
  </>} renderReasoning={() => <>
    <p>JavaScript calls a conversion hook when an object meets an arithmetic or string operator. The class supplies the hook; the stored array never changes.</p>
  </>} />
}
