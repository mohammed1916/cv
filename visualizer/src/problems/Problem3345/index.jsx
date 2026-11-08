import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at n.' },
    { id: 'check', label: 'Check', description: 'Multiply the digits and test divisibility by t.' },
    { id: 'done', label: 'Result', description: 'The first candidate that passes is the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and t',
  url: 'https://leetcode.com/problems/smallest-divisible-digit-product-i/',
  complexity: 'O(answer * digits) time; the answer stays close to n because a zero digit makes the product 0.',
  examples: [
    { label: 'Invented n and t', input: '{"n":15,"t":7}' },
    { label: 'Zero digit', input: '{"n":99,"t":10}' },
    { label: 'Single number, one step', input: '{"n":1,"t":1}' },
    { label: 'Repeated digits', input: '{"n":77,"t":3}' },
    { label: 'Largest allowed n and t', input: '{"n":100,"t":10}' },
    { label: 'Long run: ten steps', input: '{"n":89,"t":10}' },
  ],
}

export default function SmallestDivisibleDigitProductI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Digit product check">{step.candidate === null ? 'waiting' : `candidate ${step.candidate}, digit product ${step.product ?? '-'}`}</output>
  </>} renderReasoning={() => <>
    <p>Counting up from n finds the smallest valid number directly, since every number is tested in order.</p>
    <p>A digit product of 0 is divisible by every t, so a number containing a zero digit always qualifies.</p>
  </>} />
}
