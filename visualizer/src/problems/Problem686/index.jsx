import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Copy limit', description: 'Compute how many copies of a could possibly be needed.' },
    { id: 'repeat', label: 'Add a copy', description: 'Append a to the repeated text and look for b.' },
    { id: 'done', label: 'Answer', description: 'The number of copies, or −1 when none contains b.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Strings (JSON object with a and b)',
  url: 'https://leetcode.com/problems/repeated-string-match/',
  complexity: 'O(|a| · k + |b| · k) time for k = ⌈|b| / |a|⌉ + 1 copies, with the built-in substring search.',
  examples: [
    { label: 'Overlap', input: '{"a":"xyz","b":"zxyzx"}' },
    { label: 'Exact fit', input: '{"a":"pq","b":"qpq"}' },
    { label: 'Impossible', input: '{"a":"ab","b":"c"}' },
    { label: 'Single letters', input: '{"a":"a","b":"a"}' },
    { label: 'Identical strings', input: '{"a":"abc","b":"abc"}' },
    { label: 'Longest b', input: '{"a":"a","b":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}' },
    { label: 'Long run: 200 letters', input: '{"a":"abbaaaaaaaaaaaaabaab","b":"ababbbabaabaabbaaaababbaabaabaaaaaababbaabbaababbbaaabaababbbabaaabbabaabbbbbbbbbbbaaaaabbaabbbbabaabbbbbbabaaaabbabbbaabbabbaababaabbabaaabbaabaaabbbabbbbabbabaaaaababbbabbbbbababbbbaaabbabababbaabbb"}' },
  ],
}

export default function RepeatedStringMatch() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const roleAt = i => (step.at >= 0 && i >= step.at && i < step.at + (step.matchLength ?? 0) ? 'b' : '')
    return <>
      <IndexedSequence label={`Repeated text after ${step.count} cop${step.count === 1 ? 'y' : 'ies'}`} length={step.text.length} active={-1}
        valueAt={i => step.text[i]} roleAt={roleAt} />
      <output aria-label="Match position">{step.at >= 0 ? `b starts at index ${step.at}` : `Limit ${step.limit} copies`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why this limit:</strong> if b fits inside a^k, it can only touch the middle copies, so one extra copy beyond the length ratio is always enough.</p>
  </>} />
}
