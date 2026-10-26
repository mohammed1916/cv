import BasicsStory from '../families/basics/BasicsStory';
import { createBasicsDefinition } from '../families/basics/definitions.js';
const definition = createBasicsDefinition('lower');
export default function Visualizer() { return <BasicsStory kind="lower" definition={definition} />; }
