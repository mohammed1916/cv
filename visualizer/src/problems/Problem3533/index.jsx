import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ConcatSearchView from './ConcatSearchView'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'
import IndexedSequence from '../../components/shared/IndexedSequence'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: `https://leetcode.com/problems/${meta.slug}/`,
}

export default function ConcatenatedDivisibility() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <><IndexedSequence label="sorted numbers" length={run.input.nums.length} valueAt={i => run.input.nums[i]} roleAt={i => step.path.includes(i) ? 'used' : i === step.candidate ? 'candidate' : ''} /><ConcatSearchView run={run} step={step} /></>} renderReasoning={() => <>
    <p>The concatenated number can be far too long to store, but only its remainder mod k matters. Writing a number with d digits after what is already there multiplies the old value by 10^d and adds the number, and that works on the remainder alone.</p>
    <p>Two partial orders that used the same numbers and reached the same remainder have the same future: whatever can finish one can finish the other. So the state is the used set plus the remainder, at most 2^n × k of them. Once a state fails, no later order needs to explore it again.</p>
    <p>The smallest answer comes from the order of the search. Sorting by value and always trying the smallest unused number means the first complete success has the smallest possible first entry, then the smallest second entry given that one, and so on. The order is numeric, so 9 comes before 25 even though the text "25" would sort first.</p>
    <p>Only failures are recorded, because the first success ends the whole search.</p>
  </>} />
}
