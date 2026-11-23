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
  question: "Score a password by adding each distinct character's class weight: lowercase 1, uppercase 2, digit 3, and a listed symbol 5.",
  approaches: [
    { name: "Distinct-character scoring", intuition: "Track seen characters in a set and add each new character's class weight once.", time: "O(n)", space: "O(1)" },
  ],
  examples: [
    { label: 'Mixed classes', input: 'aAbB11!!' },
    { label: 'Repeats', input: 'Zz9@9@' },
    { label: 'One character', input: 'a' },
    { label: 'Equal characters', input: 'AAAA' },
    { label: 'Longest allowed password', input: 'Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!Aa1!' },
    { label: 'Long run: 60 characters', input: 'R!ozqQT5INbLaPSoqOnwmFvlmnvFVNCH3KjbvP571nxKu$cHCDhLDYyQN62p' },
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
