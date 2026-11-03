import withProblemStory from '../../components/shared/withProblemStory'
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import storyGuide from './storyGuide.json'
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm'

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases,
  inputLabel: 'JSON object with heights, bricks and ladders',
  url: 'https://leetcode.com/problems/furthest-building-you-can-reach/',
  complexity: 'O(n log n) time with a heap of at most `ladders` climbs; O(n) extra space.',
  examples: [
    { label: 'Tight', input: '{"heights":[1,5,3,8,2,9],"bricks":4,"ladders":1}' },
    { label: 'Flat', input: '{"heights":[3,3,3,3],"bricks":0,"ladders":0}' },
    { label: 'No help', input: '{"heights":[2,6,1,9,10],"bricks":6,"ladders":0}' },
  ],
}

function Skyline({ snapshot }) {
  const { heights, current, reached, bricks, ladders, climbs } = snapshot
  const max = Math.max(1, ...heights)
  return <>
    <svg width={520} height={160} role="img" aria-label="Building heights">
      {heights.map((h, k) => {
        const barH = (h / max) * 120
        return <g key={k}>
          <rect x={20 + k * 28} y={130 - barH} width={22} height={barH} fill={k === current ? '#0891b2' : k <= reached ? '#67e8f9' : 'rgba(128,128,128,0.35)'} />
          <text x={31 + k * 28} y={148} textAnchor="middle" fontSize={11} fill="currentColor">{k + 1}</text>
        </g>
      })}
    </svg>
    <p>Bricks left: {bricks} · Ladders: {ladders} · Climbs held by ladders or heap: {climbs.length ? climbs.join(', ') : 'none'}</p>
    <p>Furthest reached: building {reached + 1}.</p>
  </>
}

function BuildingRun() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <Skyline snapshot={step.snapshot} />} renderReasoning={() => <>
    <p>Ladders are best used on the largest climbs, because they save the most bricks. Smaller climbs are paid with bricks when there are too many of them.</p>
    <p>The heap always holds the climbs currently assigned to ladders in sorted order, and its smallest climb is the one that is paid with bricks.</p>
  </>} />
}

export default withProblemStory(BuildingRun, storyGuide)
