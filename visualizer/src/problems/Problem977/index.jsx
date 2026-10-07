import authoredExamples0 from '../../config/examples/sequence--977.js';

import SequenceStory from '../families/sequenceStories/SequenceStory';
import { definitions } from '../families/sequenceStories/definitions';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';

const definition = { ...definitions[977], examples: authoredExamples0, url: 'https://leetcode.com/problems/squares-of-a-sorted-array/' };
function Visualizer() { return <SequenceStory definition={definition} />; }
export default withProblemStory(Visualizer, storyGuide);
