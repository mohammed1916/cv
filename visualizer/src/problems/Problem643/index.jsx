import authoredExamples0 from '../../config/examples/sequence--643.js';

import SequenceStory from '../families/sequenceStories/SequenceStory';
import { definitions } from '../families/sequenceStories/definitions';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';

const definition = { ...definitions[643], examples: authoredExamples0, url: 'https://leetcode.com/problems/maximum-average-subarray-i/' };
function Visualizer() { return <SequenceStory definition={definition} />; }
export default withProblemStory(Visualizer, storyGuide);
