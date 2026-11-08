import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LetterMapView from './LetterMapView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1153',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with str1 and str2 of equal length (e.g. {"str1":"abcd","str2":"bcda"})',
  url: 'https://leetcode.com/problems/string-transforms-into-another-string/',
  complexity: 'O(n) time and O(1) extra space beyond the 26-letter alphabet for strings of length n. The visualization caps each string at 12 letters; the official bounds were not verified.',
  examples: [
    { label: 'Possible', input: '{"str1":"abcd","str2":"bcda"}' },
    { label: 'Conflict', input: '{"str1":"aab","str2":"bcc"}' },
    { label: 'Single identical letter', input: '{"str1":"a","str2":"a"}' },
    { label: 'Longest word, cyclic shift', input: '{"str1":"abcdefghijkl","str2":"bcdefghijkla"}' },
    { label: 'Same source letter with two targets', input: '{"str1":"aabb","str2":"xyzz"}' },
    { label: 'Long run: 12 letters', input: '{"str1":"blbizgmcdhbs","str2":"tmtznrxuhqtv"}' },
  ],
}

export default function StringTransformsIntoAnotherString() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <LetterMapView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          Each letter of str1 must always become the same letter of str2, so the mapping has to be a function.
          {run ? ` The answer is ${String(run.answer)}.` : ''} {step.phase === 'spare' ? 'With every letter already in use, no temporary letter is free to break a cycle.' : ''}
        </p>
      )}
    />
  )
}
