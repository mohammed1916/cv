import authoredExamples0 from '../../config/examples/sequence--1047.js';

import SequenceStory from '../families/sequenceStories/SequenceStory';
import { definitions } from '../families/sequenceStories/definitions';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';

const definition = { ...definitions[1047], examples: authoredExamples0, url: 'https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/' };
function Visualizer() { return <SequenceStory definition={definition} />; }
export default withProblemStory(Visualizer, storyGuide);
