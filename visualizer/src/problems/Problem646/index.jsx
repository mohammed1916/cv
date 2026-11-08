import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IntervalView from '../../components/shared/IntervalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort by end', description: 'Order the pairs by their right value.' },
    { id: 'consider', label: 'Check next pair', description: 'Take the pair only if it starts strictly after the chain end.' },
    { id: 'take', label: 'Extend chain', description: 'The taken pair becomes the new chain end.' },
    { id: 'done', label: 'Answer', description: 'Return the number of taken pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Pairs (JSON array of [left, right])',
  url: 'https://leetcode.com/problems/maximum-length-of-pair-chain/',
  complexity: 'O(n log n) time for the sort and O(n) extra space for the sorted copy.',
  examples: [
    { label: 'Three steps', input: '[[1,3],[2,5],[4,6],[7,9]]' },
    { label: 'Overlap', input: '[[5,6],[1,2],[3,4],[2,3]]' },
    { label: 'Long nest', input: '[[-3,4],[0,2],[1,5],[6,8]]' },
    { label: 'One pair', input: '[[1,2]]' },
    { label: 'Equal pairs', input: '[[1,2],[1,2],[1,2]]' },
    { label: 'Extreme values', input: '[[-1000,-999],[999,1000],[0,1]]' },
    { label: 'Long run: 200 pairs', input: '[[-972,-962],[-57,-47],[-404,-398],[342,344],[667,671],[688,689],[-761,-751],[-245,-239],[-392,-383],[-736,-731],[847,850],[-850,-841],[-222,-220],[-195,-192],[635,645],[619,628],[-477,-470],[-109,-106],[-631,-624],[383,388],[447,450],[-386,-377],[-844,-841],[-416,-406],[-103,-101],[-517,-515],[-231,-229],[185,195],[-19,-17],[-717,-716],[551,560],[-513,-509],[-133,-130],[-596,-588],[-228,-227],[372,382],[-912,-907],[-316,-315],[843,851],[-408,-399],[-561,-560],[-278,-273],[939,945],[340,347],[-38,-30],[-772,-770],[-529,-523],[744,752],[-893,-883],[317,324],[607,615],[-208,-198],[-501,-495],[-438,-429],[-969,-961],[367,375],[-616,-614],[-411,-405],[809,819],[283,287],[422,424],[-331,-326],[-755,-746],[-984,-979],[-170,-168],[-660,-659],[-713,-709],[-747,-746],[-459,-454],[-547,-545],[99,100],[563,568],[581,591],[67,75],[-519,-512],[578,581],[168,176],[-779,-778],[94,102],[13,14],[334,338],[-70,-69],[754,760],[33,43],[350,360],[512,519],[-777,-772],[-31,-22],[83,85],[-387,-385],[794,801],[-547,-538],[719,720],[-810,-800],[-495,-486],[-528,-524],[-334,-330],[919,925],[14,23],[-30,-24],[670,680],[-555,-550],[-296,-288],[150,156],[974,980],[791,799],[569,576],[162,164],[341,342],[579,588],[-5,-3],[-208,-204],[-999,-995],[-573,-568],[-793,-783],[484,487],[26,30],[789,799],[-436,-428],[-526,-520],[-467,-464],[-913,-911],[-996,-992],[219,223],[-423,-414],[245,254],[-138,-135],[657,658],[498,505],[-996,-989],[404,405],[-691,-690],[796,798],[-130,-123],[306,314],[-24,-16],[284,285],[-582,-578],[-715,-708],[759,766],[-402,-399],[553,563],[572,580],[-674,-667],[-586,-582],[-590,-588],[52,61],[-545,-543],[-513,-508],[78,82],[336,342],[-207,-204],[-591,-586],[-98,-88],[916,922],[-753,-745],[692,700],[-472,-468],[-295,-294],[289,292],[-69,-68],[-326,-320],[431,437],[-894,-890],[-758,-750],[374,381],[-228,-219],[115,118],[361,371],[674,677],[375,381],[-823,-819],[-264,-259],[-752,-749],[-586,-578],[-346,-342],[265,273],[-808,-802],[-616,-611],[-232,-225],[-795,-787],[20,22],[-86,-80],[185,187],[-699,-695],[936,942],[-690,-689],[445,451],[338,347],[-482,-481],[170,172],[406,410],[-171,-166],[-228,-219],[561,565],[858,864],[369,375],[-571,-569],[185,191],[-421,-420]]' },
  ],
}

export default function PairChain() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const intervals = step.sorted.map((pair, i) => ({
      start: pair[0], end: pair[1], group: 'pairs', label: `[${pair[0]}, ${pair[1]}]`,
      role: i === step.index ? (step.take ? 'merged' : 'current') : step.kept.includes(i) ? 'kept' : i < step.index ? 'rejected' : 'pending',
    }))
    return <>
      <IntervalView title="Pairs sorted by right end" intervals={intervals}
        marker={step.current === -Infinity ? null : step.current} markerLabel="chain end"
        note={`Chain length ${step.count}${step.current === -Infinity ? '' : `, ends at ${step.current}`}`} />
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why the right end:</strong> finishing earliest leaves the most room for later pairs, so a greedy choice by right end is optimal.</p>
  </>} />
}
