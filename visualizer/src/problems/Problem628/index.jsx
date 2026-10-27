import authoredExamples0 from '../../config/examples/sequence--628.js';

import SequenceStory from '../families/sequenceStories/SequenceStory';
import { definitions } from '../families/sequenceStories/definitions';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import { code, python, LINE_MAP } from './algorithm';

const base = definitions[628];
const definition = {
  ...base,
  examples: authoredExamples0,
  url: 'https://leetcode.com/problems/maximum-product-of-three-numbers/',
  code,
  python,
  pythonStages: undefined,
  build: raw => {
    const trace = base.build(raw);
    return { ...trace, frames: trace.frames.map(frame => ({ ...frame, activeLine: LINE_MAP[frame.activeLine] ?? frame.activeLine })) };
  },
};
function Visualizer() { return <SequenceStory definition={definition} />; }
export default withProblemStory(Visualizer, storyGuide);
