import authoredExamples0 from '../../config/examples/collection--648.js';

import Story from '../families/sequenceStories/SequenceStory';
import { definitions } from '../families/collectionStories/definitionGroups/trie.js';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import { code, python, familyLine } from './algorithm';

const base = definitions[648];
const definition = {
  ...base,
  examples: authoredExamples0,
  code,
  python,
  pythonStages: undefined,
  build: raw => {
    const trace = base.build(raw);
    return { ...trace, frames: trace.frames.map(frame => ({ ...frame, activeLine: familyLine(frame) })) };
  },
};
function Visualizer() { return <Story definition={definition} />; }
export default withProblemStory(Visualizer, storyGuide);
