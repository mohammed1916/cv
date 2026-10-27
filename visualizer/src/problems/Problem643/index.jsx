import authoredExamples0 from '../../config/examples/sequence--643.js';

import SequenceStory from '../families/sequenceStories/SequenceStory';
import { definitions } from '../families/sequenceStories/definitions';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import { code, python, familyLine } from './algorithm';

const base = definitions[643];
const definition = {
  ...base,
  examples: authoredExamples0,
  url: 'https://leetcode.com/problems/maximum-average-subarray-i/',
  code,
  python,
  pythonStages: undefined,
  build: raw => {
    const trace = base.build(raw);
    return { ...trace, frames: trace.frames.map(frame => ({ ...frame, activeLine: familyLine(frame) })) };
  },
};
function Visualizer() { return <SequenceStory definition={definition} />; }
export default withProblemStory(Visualizer, storyGuide);
