import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import IntervalView from '../../components/shared/IntervalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with nothing covered.' },
    { id: 'pick', label: 'Pick clip', description: 'Take the clip that starts inside the covered prefix and reaches furthest.' },
    { id: 'stuck', label: 'Gap', description: 'No clip starts inside the covered prefix and reaches past it.' },
    { id: 'done', label: 'Complete', description: 'Report the number of clips used.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with clips (1 to 12 [start, end] pairs, 0 to 100) and time (1 to 100)',
  url: 'https://leetcode.com/problems/video-stitching/',
  complexity: 'O(n * k) time for n clips and k clips taken. The visualization caps clips at 12.',
  examples: [
    { label: 'Example 1', input: '{"clips":[[0,2],[4,6],[8,10],[1,9],[1,5],[5,9]],"time":10}' },
    { label: 'Gap', input: '{"clips":[[0,1],[1,2]],"time":5}' },
    { label: 'Short but enough', input: '{"clips":[[0,4],[2,8]],"time":6}' },
    { label: 'Single clip', input: '{"clips":[[0,1]],"time":1}' },
    { label: 'Repeated clips', input: '{"clips":[[0,3],[0,3],[3,6]],"time":6}' },
    { label: 'One clip covers the largest time', input: '{"clips":[[0,100]],"time":100}' },
    { label: 'Long run: 12 clips', input: '{"clips":[[28,48],[26,39],[10,72],[99,100],[38,62],[77,98],[39,75],[97,97],[99,99],[81,81],[89,97],[58,70]],"time":1}' },
  ],
}

export default function VideoStitching() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { clips, time } = run.input
    const intervals = clips.map(([start, end], index) => ({
      start, end, label: `clip ${index}`,
      role: step.picked.includes(index) ? 'kept' : index === step.viaIndex ? 'current' : clips[index][0] <= step.covered && end > step.covered ? 'active' : 'pending',
    }))
    return <>
      <IntervalView title={`Number line from 0 to ${time}`} intervals={intervals} marker={step.covered} markerLabel="covered up to" closed={false}
        note="Each bar is a clip. The marker is the covered prefix; a clip helps only if it starts at or before the marker." />
      <IndexedSequence label="Clips picked" length={step.picked.length || 1} valueAt={i => (step.picked[i] !== undefined ? `[${clips[step.picked[i]].join(', ')}]` : '-')} active={step.picked.length - 1} />
      <output aria-label="Coverage">{`Covered up to ${step.covered} of ${time}; clips used: ${step.used}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each step extends the covered prefix with the usable clip that reaches furthest. A clip starting after the marker cannot help yet.</p>
    <p>A clip that reaches further never does worse than one that reaches less from the same prefix, so the count is minimal.</p>
  </>} />
}
