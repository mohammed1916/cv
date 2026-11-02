import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No digit has been read.' },
    { id: 'top', label: 'New largest', description: 'The digit becomes the largest; the old largest moves to second.' },
    { id: 'second', label: 'New second', description: 'The digit becomes the second largest.' },
    { id: 'skip', label: 'No change', description: 'The digit does not beat either tracked digit.' },
    { id: 'done', label: 'Result', description: 'Multiply the two tracked digits.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integer n from 10 to 1000000000',
  url: 'https://leetcode.com/problems/maximum-product-of-two-digits/',
  complexity: 'O(d) time and O(1) space for d digits.',
  examples: [
    { label: 'Example 1', input: '31' },
    { label: 'Example 2', input: '22' },
    { label: 'Example 3', input: '1020' },
  ],
}

export default function MaximumProductOfTwoDigits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <ol aria-label="Digits of n">
      {String(run.input).split('').map((digit, index) => <li key={index} data-role={step.index === index ? 'current' : ''}>{digit}</li>)}
    </ol>
    <output aria-label="Tracked digits">{`largest ${step.first}, second ${step.second}`}</output>
  </>} renderReasoning={() => <>
    <p>The best product uses the two largest digits in different positions. Tracking those two values while reading the digits once gives the answer without sorting.</p>
    <p>A digit that is not above the second largest cannot change the product, so it is skipped.</p>
  </>} />
}
