import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
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
    <section aria-label="Words">
      <ol>{run.input.caption.trim().split(/\s+/).filter(Boolean).map((word, i) => (
        <li key={i} data-role={i < step.index ? 'read' : i === step.index ? 'active' : ''}>{word}</li>
      ))}</ol>
    </section>
    <output aria-label="Tag so far">{`Tag so far: #${step.tag || ''}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The first word stays lowercase, and every later word starts with a capital letter. The hashtag is cut to 100 characters.</p>
  </>} />
}
