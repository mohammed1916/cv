import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PrefixTrieView from './PrefixTrieView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3491',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with numbers: a list of digit strings',
  url: 'https://leetcode.com/problems/phone-number-prefix/',
  complexity: 'O(S) time and O(S) space for S total digits: each digit is visited once while inserting into the trie. The visualization caps the input at 8 numbers of up to 10 digits.',
  examples: [
    { label: 'Prefix-free', input: '{"numbers":["911","97625","9725","3"]}' },
    { label: 'Prefix found', input: '{"numbers":["1234","12","56"]}' },
    { label: 'Duplicate', input: '{"numbers":["77","705","77"]}' },
  ],
}

export default function PhoneNumberPrefixVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PrefixTrieView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
