import BasicsStory from '../families/basics/BasicsStory';
import { createBasicsDefinition } from '../families/basics/definitions.js';
const definition = createBasicsDefinition('bfs');
export default function Visualizer() { return <BasicsStory kind="bfs" definition={definition} />; }
