import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LengthLadderView from './LengthLadderView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2533',
  phases: [
    { id: 'setup', label: 'Empty', description: 'The empty string is the base case.' },
    { id: 'length', label: 'Length', description: 'Visit the next total length.' },
    { id: 'zero', label: 'Zero block', description: 'Extend strings by a block of zeros.' },
    { id: 'one', label: 'One block', description: 'Extend strings by a block of ones.' },
    { id: 'sum', label: 'Sum', description: 'Add the counted lengths.' },
    { id: 'done', label: 'Result', description: 'Report the total modulo the prime.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with min_length, max_length, zero_group and one_group',
  url: 'https://leetcode.com/problems/number-of-good-binary-strings/',
  complexity: 'O(maxLength) time and space: each length is built from at most two shorter lengths, then the counted lengths are summed. Results are reduced modulo 1000000007. The visualization caps maxLength at 30 and the blocks at 10; the official limits are larger. The parameter names are used as the statement names them.',
  examples: [
    { label: 'Short range', input: '{"min_length":3,"max_length":5,"zero_group":1,"one_group":2}' },
    { label: 'Longer blocks', input: '{"min_length":4,"max_length":6,"zero_group":2,"one_group":3}' },
    { label: 'Equal blocks', input: '{"min_length":2,"max_length":4,"zero_group":2,"one_group":2}' },
    { label: 'Single length', input: '{"min_length":1,"max_length":1,"zero_group":1,"one_group":1}' },
    { label: 'Fixed length three', input: '{"min_length":3,"max_length":3,"zero_group":2,"one_group":2}' },
    { label: 'Full range with largest groups', input: '{"min_length":1,"max_length":30,"zero_group":10,"one_group":10}' },
    { label: 'Long run: lengths 20 to 30', input: '{"min_length":20,"max_length":30,"zero_group":5,"one_group":2}' },
  ],
}

export default function NumberOfGoodBinaryStrings() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <LengthLadderView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} Each good string ends with exactly one block, so its count is the count of the shorter prefix strings.</p>}
    />
  )
}
