import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LinkedListLane from '../../components/shared/LinkedListLane'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '143',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'List of integers (JSON)',
  url: 'https://leetcode.com/problems/reorder-list/',
  complexity: 'O(n) time and O(1) extra pointers: find the middle, reverse the back half in place, then weave.',
  examples: [
    { label: 'Even count', input: '[1,2,3,4]' },
    { label: 'Odd count', input: '[10,20,30,40,50]' },
    { label: 'Single value', input: '[7]' },
  ],
}

function lane(values, prefix) {
  return values.map((value, index) => ({ id: `${prefix}${index}`, value }))
}

export default function ReorderList() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const values = run.input
    const { split, second = [], result = [], step: current, slow, fast } = step.snapshot
    const original = lane(values, 'o')
    const pointers = []
    if (slow !== undefined && values.length > 0) pointers.push({ id: `o${slow}`, label: 'slow', tone: 'info' })
    if (fast !== undefined && values.length > 0 && fast < values.length) pointers.push({ id: `o${fast}`, label: 'fast', tone: 'warning' })
    const roles = {}
    if (split !== undefined) for (let i = split; i < values.length; i++) roles[`o${i}`] = 'visited'
    const reversedNodes = lane(second, 'r')
    const woven = lane(result, 'w')
    return <>
      <LinkedListLane title="Original order" nodes={original} pointers={pointers} roles={roles}
        note={split === undefined ? 'Fast pointer moves two places per slow move.' : `First half: indices 0 to ${split - 1}. Shaded: second half.`} />
      {split !== undefined && <LinkedListLane title="Second half reversed" nodes={reversedNodes}
        note="Its last value is taken first when weaving." />}
      {result.length > 0 && <LinkedListLane title="Woven result" nodes={woven}
        pointers={current !== undefined ? [{ id: `w${result.length - 1}`, label: 'latest', tone: 'primary' }] : []}
        note="Front, back, front, back." />}
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Three steps:</strong> find the middle, reverse the second half, then alternate between the two halves.</p>
    <p><strong>Why reverse:</strong> the last original value must be the first one taken from the back half.</p>
  </>} />
}
