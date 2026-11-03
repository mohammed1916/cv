import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ExpansionStackView from './ExpansionStackView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3481',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with text and replacements ([key, value] pairs; use %key% for references)',
  url: 'https://leetcode.com/problems/apply-substitutions/',
  complexity: 'O(L + V) time and space, where L is the text length and V the total length of the replacement values: each key is expanded once and its result is memoised. The visualization caps the text at 40 characters and six keys.',
  examples: [
    { label: 'Two levels', input: '{"text":"a%bc%d","replacements":[["bc","x%y%"],["y","zz"]]}' },
    { label: 'Shared key', input: '{"text":"%q%-%q%","replacements":[["q","ab"]]}' },
    { label: 'Plain text', input: '{"text":"nothing here","replacements":[["k","v"]]}' },
  ],
}

export default function ApplySubstitutionsVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ExpansionStackView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
