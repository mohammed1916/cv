import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, pythonLineMap } from './algorithm'

const definition = {
  phases: [
    { id: 'init', label: 'Setup', description: 'Start with no teams counted.' },
    { id: 'scan', label: 'Middle', description: 'Choose each soldier as the middle member of a team.' },
    { id: 'count', label: 'Count sides', description: 'Count smaller and larger ratings on the left and right.' },
    { id: 'add', label: 'Add teams', description: 'Add the increasing and decreasing teams centred on this soldier.' },
    { id: 'done', label: 'Result', description: 'Report the total number of teams.' },
  ],
  parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Ratings (JSON object with rating)',
  url: 'https://leetcode.com/problems/count-number-of-teams/',
  complexity: 'O(n²) time and O(1) extra space for n soldiers. The visualization caps input at 50 soldiers.',
  examples: [
    { label: 'Mixed', input: '{"rating":[2,5,3,4,1]}' },
    { label: 'No team', input: '{"rating":[2,1,3]}' },
    { label: 'Increasing', input: '{"rating":[1,2,3,4]}' },
    { label: "Three ratings", input: "{\"rating\":[1,2,3]}" },
    { label: "Descending run", input: "{\"rating\":[9,7,5,3,1]}" },
    { label: "Largest ratings", input: "{\"rating\":[100000,1,99999,2,99998]}" },
    { label: "Long run: 50 ratings", input: "{\"rating\":[18973,4994,82877,44934,88868,72892,26961,16976,84874,1000,54919,62907,22967,70895,66901,32952,68898,6991,52922,46931,10985,90865,30955,98853,92862,40940,14979,20970,38943,64904,42937,96856,34949,74889,50925,36946,48928,24964,2997,80880,58913,12982,86871,56916,60910,8988,28958,94859,78883,76886]}" },
  ],
}

export default function CountNumberOfTeams() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Ratings" length={run.input.rating.length} valueAt={i => run.input.rating[i]}
      active={step.j ?? -1} roleAt={i => (step.j === null || step.j === undefined ? '' : i < step.j ? 'left' : i > step.j ? 'right' : 'middle')} />
    <RecordStateTable label="Counts around each middle soldier" columns={['middle j', 'rating', 'left smaller', 'left larger', 'right smaller', 'right larger', 'teams']}
      activeRow={step.j ?? -1}
      rows={run.input.rating.slice(0, (step.j ?? -1) + 1).map((r, j) => {
        const left = run.input.rating.slice(0, j), right = run.input.rating.slice(j + 1)
        const ls = left.filter(x => x < r).length, lg = left.filter(x => x > r).length
        const rs = right.filter(x => x < r).length, rg = right.filter(x => x > r).length
        return { 'middle j': j, rating: r, 'left smaller': ls, 'left larger': lg, 'right smaller': rs, 'right larger': rg, teams: ls * rg + lg * rs }
      })} />
    <p>Total teams so far: {step.total}{step.counts ? ` · left <${step.counts.leftLess} >${step.counts.leftGreater} · right <${step.counts.rightLess} >${step.counts.rightGreater}` : ''}</p>
  </>} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
