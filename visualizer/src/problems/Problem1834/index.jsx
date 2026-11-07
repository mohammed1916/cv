import authoredExamples from '../../config/examples/collection--1834.js';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import SingleCpuScheduleView from '../../components/shared/SingleCpuScheduleView';
import { definitions } from '../families/collectionStories/definitionGroups/continued.js';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';

const base = definitions[1834];
const definition = { ...base, examples: authoredExamples, build(input) {
  const run = base.build(input);
  return { ...run, frames: run.frames.filter(frame => frame.scheduling) };
} };
function Visualizer() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({step}) => {
      const s = step.scheduling;
      const done = step.phase === 'done';
      return <SingleCpuScheduleView {...s}
        eventLabel={done ? 'All tasks processed' : undefined}
        selected={done ? null : s.selected}
        event={done ? 'Done' : s.event} />;
    }}
    renderReasoning={() => <><p>One CPU never preempts. When it is free, every task that has arrived joins the ready set; the shortest duration runs next, and equal durations go to the smaller original index.</p><p>If nothing is ready, the clock jumps to the next arrival. The final answer is the processing order, and the last bar ends when the last task finishes.</p></>} />;
}
export default withProblemStory(Visualizer, storyGuide);
