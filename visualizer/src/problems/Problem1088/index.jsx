import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ConfusingLanesView from './ConfusingLanesView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1088',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Integer n from 1 to 1000 (e.g. 20)',
  url: 'https://leetcode.com/problems/confusing-number-ii/',
  complexity: 'O(V) time and O(depth) recursion space, where V is the number of valid digit strings up to n (at most about 5 per digit). The visualization caps n at 1000; the official bound was not verified.',
  examples: [
    { label: 'n = 30', input: '30' },
    { label: 'n = 250', input: '250' },
  ],
}

export default function ConfusingNumberII() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ConfusingLanesView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          Every number is built from valid digits, and its rotation is built alongside it, so each check is one comparison.
          {run ? ` ${run.answer} number${run.answer === 1 ? '' : 's'} from 1 to ${run.input} are confusing.` : ''} {step.phase === 'prune' ? 'Once a number passes n, every extension of it does too.' : ''}
        </p>
      )}
    />
  )
}
