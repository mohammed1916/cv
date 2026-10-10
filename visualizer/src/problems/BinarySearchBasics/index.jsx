import BasicsStory from '../families/basics/BasicsStory';
import { createBasicsDefinition } from '../families/basics/definitions.js';
const definition = createBasicsDefinition('binary');
export default function Visualizer() { return <BasicsStory kind="binary" definition={definition} />; }
