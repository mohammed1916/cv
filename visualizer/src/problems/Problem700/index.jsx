import { getExamples } from '../../config/examplesRegistry';
import Story from '../families/treeStories/TreeStory';
import { definitions } from '../families/treeStories/definitions';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';

const definition = { ...definitions[700], examples: getExamples('tree:700') };
function Visualizer() { return <Story definition={definition} />; }
export default withProblemStory(Visualizer, storyGuide);
