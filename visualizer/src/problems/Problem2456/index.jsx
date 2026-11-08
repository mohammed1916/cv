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
    { label: 'Own case 1', input: '{"creators":["bmjdf","bmjdf","bmjdf"],"ids":["b","c","d"],"views":[2,3,3]}' },
    { label: 'Single video', input: '{"creators":["ada"],"ids":["v1"],"views":[0]}' },
    { label: 'Equal views', input: '{"creators":["ann","ben","ann"],"ids":["x1","x2","x3"],"views":[4,4,4]}' },
    { label: 'Largest set', input: '{"creators":["zeta","echo","omega","kilo","zeta","echo","omega","kilo","zeta","echo","omega","kilo","zeta","echo","omega","kilo","zeta","echo","omega","kilo"],"ids":["v0","v1","v2","v3","v4","v5","v6","v7","v8","v9","v10","v11","v12","v13","v14","v15","v16","v17","v18","v19"],"views":[10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10]}' },
    { label: 'Long run: 20 videos', input: '{"creators":["fay","eli","amy","dee","dee","eli","amy","cal","dee","amy","eli","dee","dee","eli","fay","dee","dee","amy","cal","cal"],"ids":["id0","id1","id2","id3","id4","id5","id6","id7","id8","id9","id10","id11","id12","id13","id14","id15","id16","id17","id18","id19"],"views":[1,4,5,1,2,8,10,0,6,6,10,7,6,8,6,7,3,0,3,2]}' },
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
