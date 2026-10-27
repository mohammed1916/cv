import authoredExamples0 from '../../config/examples/collection--688.js';

import Story from '../families/sequenceStories/SequenceStory';
import { definitions } from '../families/collectionStories/definitionGroups/probabilityBoardsBatch.js';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import { code, python, LINE_MAP } from './algorithm';

const base = definitions[688];
const definition = {
  ...base,
  examples: authoredExamples0,
  code,
  python,
  pythonStages: undefined,
  build: raw => {
    const trace = base.build(raw);
    return { ...trace, frames: trace.frames.map(frame => ({ ...frame, activeLine: LINE_MAP[frame.activeLine] ?? frame.activeLine })) };
  },
};
function Visualizer() { return <Story definition={definition} />; }
export default withProblemStory(Visualizer, storyGuide);
