import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import KeyboardTripView from './KeyboardTripView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Rest', description: 'The finger rests on a.' },
    { id: 'move', label: 'Move', description: 'Travel to the next letter and add the steps.' },
    { id: 'done', label: 'Result', description: 'Report the total distance.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (lowercase letters, up to 40)',
  url: 'https://leetcode.com/problems/total-distance-to-type-a-string-using-one-finger/',
  complexity: 'O(n) time for a string of length n, with a fixed 26-key lookup table.',
  examples: [
    { label: 'Short word', input: '{"s":"gnome"}' },
    { label: 'Corner keys', input: '{"s":"zpqm"}' },
  ],
}

export default function TotalDistanceToTypeAStringUsingOneFinger() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <KeyboardTripView run={run} step={step} />} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p>Each key has a fixed row and column, so the distance between two letters is the Manhattan distance of their coordinates. The finger's position after each letter is the next letter's key.</p>
    {run ? <p>Final answer: {run.result}.</p> : null}
  </>} />
}
