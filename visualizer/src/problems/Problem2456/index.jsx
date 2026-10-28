import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HashMapView from '../../components/shared/HashMapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty tables', description: 'No creator has views yet.' },
    { id: 'video', label: 'Add video', description: 'Add the video’s views to its creator and update the best video.' },
    { id: 'done', label: 'Most popular', description: 'Report every creator with the highest total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Videos as JSON: {"creators": [...], "ids": [...], "views": [...]}',
  url: 'https://leetcode.com/problems/most-popular-video-creator/',
  complexity: 'O(n log n) time for the final sort of creator names, with O(n) space for the maps. The visualization caps input at 20 videos.',
  examples: [
    { label: 'Example 1', input: '{"creators":["alice","bob","alice","charlie"],"ids":["one","two","three","four"],"views":[5,10,5,4]}' },
    { label: 'Example 2', input: '{"creators":["alice","alice","alice"],"ids":["a","b","c"],"views":[1,2,2]}' },
  ],
}

export default function MostPopularCreator() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <HashMapView maps={step.maps} ops={step.ops} />
    <output aria-label="Most popular so far">{step.result.length ? `Answer: ${step.result.map(([c, d]) => `[${c}, ${d}]`).join(' ')}` : 'Answer not ready yet'}</output>
  </>} renderReasoning={() => <>
    <p>A creator’s popularity is the sum of all of their views, so one running total per creator is enough.</p>
    <p>Each creator reports only their most viewed video; equal views go to the smaller id, as the statement requires.</p>
  </>} />
}
