import authoredExamples0 from '../../config/examples/collection--2182.js';

import Story from '../families/sequenceStories/SequenceStory';
import { definitions } from '../families/collectionStories/definitionGroups/rankAndConstructionBatch.js';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';

const definition = { ...definitions[2182], examples: authoredExamples0 };
function Visualizer() { return <Story definition={definition} />; }
export default withProblemStory(Visualizer, storyGuide);
