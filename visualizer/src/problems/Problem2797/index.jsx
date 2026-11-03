import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'

const code = `partial application with placeholders
  bound = the fixed arguments, where a placeholder marks a gap
  on call with new arguments
    fill each gap in order from the new arguments
    append any arguments left over
    return the full argument list for the function`
const python = `def partial_args(bound, call_args):
    queue = list(call_args)
    result = []
    for slot in bound:
        if slot == PLACEHOLDER and queue:
            result.append(queue.pop(0))
        elif slot != PLACEHOLDER:
            result.append(slot)
    return result + queue`

const PH = '_'

function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.bound) || !Array.isArray(input.call)) {
    throw new Error('Use { "bound": [...], "call": [...] } where "_" marks a placeholder.')
  }
  return input
}

function buildTrace({ bound, call }) {
  const queue = [...call]
  const result = []
  const frames = [{ phase: 'start', activeLine: 1, message: 'Fixed arguments are bound; gaps wait for the call.', at: -1, out: bound.map(String) }]
  bound.forEach((slot, i) => {
    if (slot === PH && queue.length) {
      result.push(queue.shift())
      frames.push({ phase: 'step', activeLine: 5, message: `Gap ${i} takes the next call argument.`, at: i, out: [...result.map(String)] })
    } else if (slot !== PH) {
      result.push(slot)
      frames.push({ phase: 'step', activeLine: 4, message: `Fixed value ${JSON.stringify(slot)} is kept.`, at: i, out: [...result.map(String)] })
    }
  })
  const leftover = queue
  result.push(...leftover)
  frames.push({ phase: 'done', activeLine: 7, message: `Final argument list: [${result.map(v => JSON.stringify(v)).join(', ')}].`, at: -1, out: result.map(String) })
  return { frames }
}

const definition = {
  phases: [
    { id: 'start', label: 'Bound', description: 'Record the fixed arguments and gaps.' },
    { id: 'step', label: 'Fill', description: 'Walk the bound list and fill gaps in order.' },
    { id: 'done', label: 'Call', description: 'The full argument list is ready.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with bound (use "_" for placeholders) and call arguments',
  url: 'https://leetcode.com/problems/partial-function-with-placeholders/',
  complexity: 'O(n) time for n bound slots plus leftover arguments.',
  examples: [
    { label: 'Two gaps', input: '{"bound":["_",2,"_"],"call":[1,3]}' },
    { label: 'Extra args', input: '{"bound":[1,"_"],"call":[9,8,7]}' },
  ],
}

export default function PartialFunctionWithPlaceholders() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Argument list" length={step.out.length} valueAt={i => step.out[i]} active={step.at} />
  </>} renderReasoning={() => <>
    <p>The bound list is a template. Placeholders are not values; they are waiting slots.</p>
    <p>Each new call argument goes into the earliest open slot, and anything left over goes at the end.</p>
  </>} />
}
