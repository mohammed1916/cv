import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HashMapView from '../../components/shared/HashMapView'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty set', description: 'No integer has been counted yet.' },
    { id: 'add', label: 'Add', description: 'Add each number and its reversal to the set.' },
    { id: 'done', label: 'Count', description: 'Report the size of the set.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers as JSON: {"nums": [...]}',
  url: 'https://leetcode.com/problems/count-number-of-distinct-integers-after-reverse-operations/',
  complexity: 'O(n * d) time for n numbers of d digits, and O(n) space. The visualization caps input at 30 numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,13,10,12,31]}' },
    { label: 'Example 2', input: '{"nums":[2,2,2]}' },
    { label: 'Single number', input: '{"nums":[1]}' },
    { label: 'Equal values', input: '{"nums":[7,7,7]}' },
    { label: 'Largest values', input: '{"nums":[1000000,1,1000000]}' },
    { label: 'Long run: 30 numbers', input: '{"nums":[546874,46985,720697,751803,918452,949133,26493,21920,309053,442653,559544,122108,98064,907210,637205,452756,125173,321608,363699,618159,550779,542906,477348,284246,975198,449788,933151,95877,832277,153319]}' },
  ],
}

export default function DistinctAfterReverse() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index ?? -1} />
    <HashMapView maps={step.maps} ops={step.ops} />
    <output aria-label="Distinct so far">{`Distinct integers so far: ${step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>Every number contributes two integers: itself and its digits reversed. The set removes repeats, including reversals that match other numbers.</p>
    <p>Reversing a number drops leading zeros automatically, so 10 becomes 1.</p>
  </>} />
}
