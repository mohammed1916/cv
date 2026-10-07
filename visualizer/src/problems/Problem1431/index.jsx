import authoredExamples0 from '../../config/examples/sequence--1431.js';

import SequenceStory from '../families/sequenceStories/SequenceStory';
import { definitions } from '../families/sequenceStories/definitions';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';

const definition = { ...definitions[1431], examples: authoredExamples0, url: 'https://leetcode.com/problems/kids-with-the-greatest-number-of-candies/' };
function Visualizer() { return <SequenceStory definition={definition} />; }
export default withProblemStory(Visualizer, storyGuide);
