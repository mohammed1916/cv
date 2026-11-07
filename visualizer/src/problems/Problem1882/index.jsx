import authoredExamples from '../../config/examples/collection--1882.js';
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace';
import TaskSchedulingView from '../../components/shared/TaskSchedulingView';
import { definitions } from '../families/collectionStories/definitionGroups/broad.js';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';

const base = definitions[1882];
const definition = { ...base, examples: authoredExamples, build(input) {
  const run = base.build(input);
  return { ...run, frames: run.frames.filter(frame => frame.scheduling) };
} };
function Visualizer() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({step}) => <TaskSchedulingView {...step.scheduling} event={step.phase==='done' ? 'All tasks assigned' : step.scheduling.event} selected={step.phase==='done' ? null : step.scheduling.selected} />}
    renderReasoning={() => <><p>Two orders matter: tasks wait by arrival index; idle servers compete by weight, then server index.</p><p>When every server is busy, jump to the earliest finish and release all servers finishing by that time before choosing. Several queued tasks can start at the same clock time.</p></>} />;
}
export default withProblemStory(Visualizer, storyGuide);
