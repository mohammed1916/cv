import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Prepare two sets.' },
    { id: 'collect', label: 'Collect', description: 'Record each letter by case.' },
    { id: 'count', label: 'Count', description: 'Check each lowercase letter.' },
    { id: 'done', label: 'Complete', description: 'Return the count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with "word" (English letters), JSON',
  url: 'https://leetcode.com/problems/count-the-number-of-special-characters-i/',
  complexity: 'O(n) time and O(1) extra space for 52 letters. The visualization caps input at 30 letters.',
  examples: [
    { label: 'Example 1', input: '{"word":"aaAbcBC"}' },
    { label: 'Example 2', input: '{"word":"abBCab"}' },
  ],
}

export default function CountTheNumberOfSpecialCharactersI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label='Characters of word' length={run.items.length} valueAt={i => String(run.items[i])} active={step.active} roleAt={i => step.roles?.[i] ?? ''} />
    <output aria-label="State">{Object.entries(step.state ?? {}).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ')}</output>
  </>} renderReasoning={() => <>
    <p>A letter is counted when its uppercase form is also present, which is a constant-time membership check.</p>
    <p>Each distinct lowercase letter is considered once, so repeats do not inflate the count.</p>
  </>} />
}
