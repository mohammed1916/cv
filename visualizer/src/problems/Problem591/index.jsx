import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The code must open an enclosing tag.' },
    { id: 'open', label: 'Open tag', description: 'Push a valid tag name.' },
    { id: 'close', label: 'Close tag', description: 'The closing tag must match the top of the stack.' },
    { id: 'cdata', label: 'CDATA', description: 'Copy literal content until ]]>.' },
    { id: 'reject', label: 'Reject', description: 'A rule was broken.' },
    { id: 'done', label: 'Complete', description: 'Return validity.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Code string (JSON string)',
  url: 'https://leetcode.com/problems/tag-validator/',
  complexity: 'O(n) time and O(n) stack space for the open tags. Each character is examined once, except CDATA content, which is skipped.',
  examples: [
    { label: 'Nested', input: '"<DIV>This is the first line <![CDATA[<div>]]></DIV>"' },
    { label: 'Tricky CDATA', input: '"<DIV>>>  ![cdata[]] <![CDATA[<div>]>]]>]]>>]</DIV>"' },
    { label: 'Crossed tags', input: '"<A>  <B> </A>   </B>"' },
    { label: 'Unclosed', input: '"<DIV>  div tag is not closed  <DIV>"' },
  ],
}

export default function TagValidator() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Characters" length={run.input.length} active={Math.min(step.index ?? 0, run.input.length - 1)} valueAt={i => run.input[i]}
      roleAt={i => i === step.index ? 'current' : ''} />
    <StackLane title="Open tags" items={step.stack} note={step.stack.length ? `depth ${step.stack.length}` : 'empty'} />
    <output aria-label="Validity">{step.phase === 'done' ? `Valid: ${String(run.result)}` : step.valid === false ? 'Invalid' : 'Scanning'}</output>
  </>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Enclosed tag rule:</strong> the stack must be empty only at the very end, so a second top-level tag after the first closes makes the code invalid.</p>
    <p>{run.input.length} characters were scanned; CDATA content is never interpreted as tags.</p>
  </>} />
}
