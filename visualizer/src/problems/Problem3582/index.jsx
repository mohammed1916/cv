import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Split', description: 'Split the caption into words.' },
    { id: 'word', label: 'Add word', description: 'Lowercase the first word, then capitalize each later word.' },
    { id: 'done', label: 'Complete', description: 'Add the hashtag and keep 100 characters.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Caption (JSON object with caption)',
  url: 'https://leetcode.com/problems/generate-tag-for-video-caption/',
  complexity: 'O(n) time and O(n) space. The visualization caps the caption at 150 characters.',
  examples: [
    { label: 'Two words', input: '{"caption":"Keep Going"}' },
    { label: 'Empty', input: '{"caption":""}' },
    { label: 'Long', input: '{"caption":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"}' },
  ],
}

export default function GenerateTagForVideoCaption() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    {(() => { const words = run.input.caption.trim().split(/\s+/).filter(Boolean); return <IndexedSequence label="Words of the caption" length={words.length}
      valueAt={index => words[index]} active={step.index} roleAt={index => index < step.index ? 'read' : ''} /> })()}
    <output aria-label="Tag so far">{`Tag so far: #${step.tag || ''}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The first word stays lowercase, and every later word starts with a capital letter. The hashtag is cut to 100 characters.</p>
  </>} />
}
