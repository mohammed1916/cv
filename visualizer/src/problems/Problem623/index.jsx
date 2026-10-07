import authoredExamples0 from '../../config/examples/tree--623.js';

import Story from '../families/treeStories/TreeStory';
import { definitions } from '../families/treeStories/definitions';
import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';

const definition = { ...definitions[623], examples: authoredExamples0 };
function Visualizer() { return <Story definition={definition} />; }
export default withProblemStory(Visualizer, storyGuide);
