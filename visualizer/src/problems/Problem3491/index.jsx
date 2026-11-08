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
    { label: 'Single digit string', input: '{"numbers":["7"]}' },
    { label: 'Equal strings tie', input: '{"numbers":["42","42","42"]}' },
    { label: 'Leading zeros and ten digits', input: '{"numbers":["007","7","0000000000"]}' },
    { label: 'Largest ten-digit values', input: '{"numbers":["9999999999","1000000000"]}' },
    { label: 'Long run: 8 ten-digit numbers', input: '{"numbers":["3727686593","8007852317","5254724675","8570837470","3110799737","9380566628","2329210046","7861771438"]}' },
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
