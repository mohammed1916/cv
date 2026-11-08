import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ChainStackView from './ChainStackView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1265',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'List of node values in order (e.g. [1,2,3])',
  url: 'https://leetcode.com/problems/print-immutable-linked-list-in-reverse/description/',
  complexity: 'O(n) time and O(n) stack space for n nodes; each node is printed once. The visualization caps the list at 12 nodes; the draft does not state an exact official bound. The list is read only through getNext and printValue.',
  examples: [
    { label: 'Three nodes', input: '[1,2,3]' },
    { label: 'Single node', input: '[9]' },
    { label: 'Five nodes', input: '[4,7,1,8,2]' },
    { label: 'Equal values', input: '[5,5,5]' },
    { label: 'Extreme values', input: '[1000000000,-1000000000,0]' },
    { label: 'Long run: 12 nodes', input: '[39,10,-2,-12,44,-48,29,23,-29,18,3,-20]' },
  ],
}

export default function Problem1265PrintImmutableLinkedListInReverse() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ChainStackView run={run} step={step} />}
      renderReasoning={() => (
        <p>The list can only be walked forward, so the first pass pushes every node. Popping the stack then reverses the order without changing any link.</p>
      )}
    />
  )
}
