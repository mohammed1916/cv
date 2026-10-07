import authoredExamples0 from '../../config/examples/collection--609.js';

import Story from '../families/sequenceStories/SequenceStory';
import { definitions } from '../families/collectionStories/definitionGroups/bitsAndTextBatch.js';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';

const definition = { ...definitions[609], examples: authoredExamples0 };
function Visualizer() { return <Story definition={definition} />; }
export default withProblemStory(Visualizer, storyGuide);
