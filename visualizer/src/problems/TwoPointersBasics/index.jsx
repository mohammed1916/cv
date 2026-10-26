import BasicsStory from '../families/basics/BasicsStory';
import { createBasicsDefinition } from '../families/basics/definitions.js';
const definition = createBasicsDefinition('pair');
export default function Visualizer() { return <BasicsStory kind="pair" definition={definition} />; }
