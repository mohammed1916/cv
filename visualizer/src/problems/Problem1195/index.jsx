import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  number: '1195',
  phases: [
    { id: 'start', label: 'Start', description: 'No output yet.' },
    { id: 'fizzbuzz', label: 'Both', description: 'Divisible by 3 and 5: the fizzbuzz worker prints.' },
    { id: 'fizz', label: 'Three', description: 'Divisible by 3 only: the fizz worker prints.' },
    { id: 'buzz', label: 'Five', description: 'Divisible by 5 only: the buzz worker prints.' },
    { id: 'number', label: 'Number', description: 'Neither: the number worker prints the number.' },
    { id: 'done', label: 'Result', description: 'Every value printed in order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, an integer from 1 to 30',
  url: 'https://leetcode.com/problems/fizz-buzz-multithreaded/',
  complexity: 'O(n) total work. In the threaded version each worker waits on a shared turn counter.',
  examples: [
    { label: 'Example', input: '{"n":15}' },
    { label: 'Short', input: '{"n":5}' },
  ],
}

export default function FizzBuzzMultithreaded() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <p aria-label="Printed so far">{step.state.join(' ') || 'nothing yet'}</p>
    <output aria-label="Current step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each worker owns one output kind and only prints when the shared counter reaches a number it owns.</p>
    <p>The visualization replays the same turn order on one thread, so the printed sequence matches the threaded version.</p>
  </>} />
}
