import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LevelMedianView from './LevelMedianView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Values will be inserted in the given order.' },
    { id: 'insert', label: 'Insert', description: 'Walk down the search tree and attach the value.' },
    { id: 'scan', label: 'Scan', description: 'Breadth-first visit; keep nodes on the chosen level.' },
    { id: 'pick', label: 'Sort and pick', description: 'Sort the level and take the upper middle.' },
    { id: 'done', label: 'Result', description: 'Report the upper median, or -1 for an absent level.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with values (distinct integers, in insertion order) and level',
  url: 'https://leetcode.com/problems/median-of-a-binary-search-tree-level/',
  complexity: 'O(n * h) time to build the tree with h its height, plus O(n log n) to sort one level. The visualization caps the tree at 15 values.',
  examples: [
    { label: 'Level two of a seven-value tree', input: '{"values":[9,4,15,2,6,12,20,1,3],"level":2}' },
    { label: 'Level one of a four-value tree', input: '{"values":[8,3,10,1],"level":1}' },
    { label: 'Single value at root', input: '{"values":[5],"level":0}' },
    { label: 'Fifteen values, level three', input: '{"values":[8,4,12,2,6,10,14,1,3,5,7,9,11,13,15],"level":3}' },
    { label: 'Negative values', input: '{"values":[-3,-8,4,-10,-5,0,9],"level":2}' },
    { label: 'Long run: 15 values', input: '{"values":[-21,67,-43,30,18,72,13,-55,-62,-32,45,97,95,57,-91],"level":3}' },
  ],
}

export default function MedianOfABinarySearchTreeLevel() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <LevelMedianView run={run} step={step} />} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p>For an even count the upper median is the larger middle value, which is the element at index floor(count / 2) after sorting.</p>
    {run ? <p>Final answer: {run.result}.</p> : null}
  </>} />
}
