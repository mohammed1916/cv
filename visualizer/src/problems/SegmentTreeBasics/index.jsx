import BasicsStory from '../families/basics/BasicsStory';
import { createBasicsDefinition } from '../families/basics/definitions.js';
const definition = createBasicsDefinition('segment');
export default function Visualizer() { return <BasicsStory kind="segment" definition={definition} />; }
