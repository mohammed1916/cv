import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
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
  ],
}

export default function VideoStitching() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Clips" length={run.input.clips.length} valueAt={index => `[${run.input.clips[index].join(', ')}]`} active={step.viaIndex} />
    <output aria-label="Coverage">{`Covered up to ${step.covered} of ${run.input.time}; clips used: ${step.used}`}</output>
  </>} renderReasoning={() => <>
    <p>Each step extends the covered prefix with the usable clip that reaches furthest.</p>
    <p>A clip that reaches further never does worse than one that reaches less from the same prefix, so the count is minimal.</p>
  </>} />
}
