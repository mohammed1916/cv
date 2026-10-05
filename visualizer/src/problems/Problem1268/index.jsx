import { getExamples } from '../../config/examplesRegistry';
import Story from '../families/sequenceStories/SequenceStory';
import { definitions } from '../families/collectionStories/definitions';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';

const definition = { ...definitions[1268], examples: getExamples('collection:1268') };
function Visualizer() { return <Story definition={definition} />; }
export default withProblemStory(Visualizer, storyGuide);
