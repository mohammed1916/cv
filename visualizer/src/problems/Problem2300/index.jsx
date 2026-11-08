import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: 'Sort a copy of the potions by strength.' },
    { id: 'search', label: 'Search', description: 'Binary search for the weakest potion that succeeds.' },
    { id: 'count', label: 'Count', description: 'Every potion from that position on succeeds.' },
    { id: 'done', label: 'Complete', description: 'Report the count for each spell.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with spells, potions and success (JSON)',
  url: 'https://leetcode.com/problems/successful-pairs-of-spells-and-potions/',
  complexity: 'O((n + m) log m) time and O(m) extra space for n spells and m potions.',
  examples: [
    { label: 'Three spells, four potions', input: '{"spells":[3,8,5],"potions":[2,9,4,7],"success":20}' },
    { label: 'Weak spells', input: '{"spells":[10,1],"potions":[5,6,2],"success":30}' },
    { label: 'Single spell and potion', input: '{"spells":[4],"potions":[3],"success":12}' },
    { label: 'Equal spells and potions', input: '{"spells":[2,2],"potions":[4,4],"success":8}' },
    { label: 'Twelve strong spells', input: '{"spells":[20,20,20,20,20,20,20,20,20,20,20,20],"potions":[1,2,3,4,5,6,7,8,9,10,11,12],"success":100}' },
    { label: 'Long run: 12 and 12', input: '{"spells":[19,11,2,7,1,4,14,8,5,8,18,2],"potions":[16,19,5,20,1,14,1,14,18,18,4,11],"success":99}' },
  ],
}

export default function SuccessfulPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const inRange = index => step.lo !== null && index >= step.lo && index < step.hi
    return <>
      <IndexedSequence label="Sorted potions" length={step.sorted.length} active={step.mid}
        valueAt={index => step.sorted[index]}
        roleAt={index => (index === step.mid ? 'probe' : inRange(index) ? 'range' : '')} />
      <output aria-label="Spell state">{step.need === null ? 'Sorted and ready' : `Spell ${step.spell}: needs ${step.need}${step.count === null ? '' : `, count ${step.count}`}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A spell succeeds with a potion when the product reaches success, so each spell needs a threshold of ceil(success / spell).</p>
    <p>Once the potions are sorted, every potion at or above the threshold is counted by one binary search.</p>
  </>} />
}
