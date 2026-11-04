import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1456',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with text and k (JSON)',
  url: 'https://leetcode.com/problems/maximum-number-of-vowels-in-a-substring-of-given-length/',
  complexity: 'O(n) time and O(1) extra space: each character enters and leaves the window once.',
  examples: [
    { label: 'Vowel run', input: '{"text":"aeiouxyz","k":3}' },
    { label: 'Mixed', input: '{"text":"bcdfgaeb","k":2}' },
    { label: 'Whole text', input: '{"text":"aei","k":3}' },
  ],
}

import IndexedSequence from '../../components/shared/IndexedSequence'

export default function MaxVowelsWindow() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { text, k } = run.input
    const { start, count, best, bestStart, entering, leaving } = step.snapshot
    const hasWindow = start !== null && start !== undefined
    const left = hasWindow ? start : -1
    const right = hasWindow ? start + k - 1 : -1
    const bestEnd = bestStart + k - 1
    const roleAt = i => {
      const parts = []
      if (hasWindow && i === left) parts.push('l')
      if (hasWindow && i === right) parts.push('r')
      if (i >= bestStart && i <= bestEnd && best > 0) parts.push('best')
      return parts.join(' ')
    }
    return <>
      <IndexedSequence label={`Text, with the window of length ${k} from l to r`} length={text.length} active={hasWindow ? right : -1}
        valueAt={i => text[i]} roleAt={roleAt} />
      <p style={{ color: 'var(--text)' }}>
        {hasWindow ? `Window [${left}, ${right}] has ${count} vowels.` : 'No window yet.'}
        {entering !== null && entering !== undefined ? ` Entering ${text[entering]} at ${entering}, leaving ${text[leaving]} at ${leaving}.` : ''}
      </p>
      <p style={{ color: 'var(--text)' }}>Best so far: {best} vowels, in the window starting at {bestStart}.</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Slide, do not rescan:</strong> moving the window one step adds the character entering on the right and removes the one leaving on the left.</p>
    <p>{step.message}</p>
  </>} />
}
