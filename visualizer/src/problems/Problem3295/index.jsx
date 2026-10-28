import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Build the banned set.' },
    { id: 'scan', label: 'Scan', description: 'Count banned words in the message.' },
    { id: 'done', label: 'Complete', description: 'Report spam or not.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with "message" and "banned_words" (lists of lowercase words), JSON',
  url: 'https://leetcode.com/problems/report-spam-message/',
  complexity: 'O(m + b) time with a hash set of banned words. The visualization caps lists at 8 words.',
  examples: [
    { label: 'Example 1', input: '{"message":["hello","world","leetcode"],"banned_words":["world","hello"]}' },
    { label: 'Example 2', input: '{"message":["hello","programming","fellow","leetcode"],"banned_words":["world","hello"]}' },
  ],
}

export default function ReportSpamMessage() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label='Message words' length={run.items.length} valueAt={i => String(run.items[i])} active={step.active} roleAt={i => step.roles?.[i] ?? ''} />
    <output aria-label="State">{Object.entries(step.state ?? {}).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ')}</output>
  </>} renderReasoning={() => <>
    <p>Every occurrence of a banned word in the message counts, so repeated words add to the total.</p>
    <p>Stopping at two is enough, but the full scan keeps the trace easy to follow.</p>
  </>} />
}
