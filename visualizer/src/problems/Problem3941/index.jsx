import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PasswordTilesView from './PasswordTilesView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3941',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Password of 1 to 60 letters, digits, or the symbols ! @ # $',
  url: 'https://leetcode.com/problems/password-strength/',
  complexity: 'O(n) time and O(1) extra space for n characters, since only 64 characters are possible. The visualization caps the password at 60 characters.',
  examples: [
    { label: 'Mixed classes', input: 'aAbB11!!' },
    { label: 'Repeats', input: 'Zz9@9@' },
  ],
}

export default function Problem3941Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PasswordTilesView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
