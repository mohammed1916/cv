import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Minutes (JSON object with customers, grumpy and minutes)',
  url: 'https://leetcode.com/problems/grumpy-bookstore-owner/',
  complexity: 'O(n) time and O(1) extra space after the input is read. The visualization caps input at 40 minutes.',
  examples: [
    { label: 'Competing windows', input: '{"customers":[4,9,2,7,5,8,3,11,6,4,10,2],"grumpy":[0,1,1,0,1,1,0,1,0,1,1,0],"minutes":4}' },
    { label: 'No grumpy minutes', input: '{"customers":[3,7,4,9],"grumpy":[0,0,0,0],"minutes":2}' },
    { label: 'Whole day', input: '{"customers":[6,2,8,4],"grumpy":[1,0,1,1],"minutes":4}' },
    { label: 'Empty minutes', input: '{"customers":[0,5,0,7,0],"grumpy":[1,1,0,1,1],"minutes":1}' },
    { label: 'Single grumpy minute', input: '{"customers":[3],"grumpy":[1],"minutes":1}' },
    { label: 'Never grumpy', input: '{"customers":[2,4],"grumpy":[0,0],"minutes":1}' },
    { label: 'Window covers every minute', input: '{"customers":[1,2,3,4],"grumpy":[1,1,1,1],"minutes":4}' },
    { label: 'Long run: 40 minutes', input: '{"customers":[159,244,180,969,617,448,531,222,234,688,606,167,696,879,372,192,72,580,136,530,516,988,44,673,286,185,19,850,278,382,918,874,41,710,923,180,514,334,377,853],"grumpy":[0,1,1,1,0,0,1,0,0,1,0,1,0,0,1,1,1,1,0,1,1,1,0,0,0,0,0,0,1,0,1,1,0,0,0,1,0,1,1,1],"minutes":7}' },
  ],
}

export default function GrumpyBookstoreOwner() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { customers, grumpy, windowStart, windowEnd, window, best, bestStart, calm } = step.snapshot
    return <>
      <IndexedSequence label="Customers per minute" length={customers.length} valueAt={i => customers[i]}
        active={windowStart}
        roleAt={i => (i === windowStart ? 'l' : i === windowEnd - 1 ? 'r' : i > windowStart && i < windowEnd - 1 ? 'window' : grumpy[i] === 1 ? 'grumpy' : 'calm')} />
      <IndexedSequence label="Grumpy minutes (1 means the owner is grumpy)" length={grumpy.length} valueAt={i => grumpy[i]} active={windowStart}
        roleAt={i => (i >= windowStart && i < windowEnd ? 'window' : '')} />
      <p>Calm baseline: {calm}. Window [{windowStart}, {windowEnd - 1}] recovers {window}. Best so far: {best}, starting at minute {bestStart}.</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Calm minutes are counted once in the baseline. The window only adds grumpy minutes it covers, so sliding it one step changes the total by the entering grumpy customers minus the leaving grumpy customers.</p>
  </>} />
}
