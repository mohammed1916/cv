import { getExamples } from '../../config/examplesRegistry';
import SequenceStory from '../families/sequenceStories/SequenceStory';
import { definitions } from '../families/scanStories/definitions';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';

const definition = { ...definitions[709], examples: getExamples('scan:709') };
function Visualizer() { return <SequenceStory definition={definition} />; }
export default withProblemStory(Visualizer, storyGuide);
