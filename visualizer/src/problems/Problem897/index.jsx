import { getExamples } from '../../config/examplesRegistry';
import Story from '../families/treeStories/TreeStory';
import { definitions } from '../families/treeStories/definitions';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';

const definition = { ...definitions[897], examples: getExamples('tree:897') };
function Visualizer() { return <Story definition={definition} />; }
export default withProblemStory(Visualizer, storyGuide);
