import BasicsStory from '../families/basics/BasicsStory';
import { createBasicsDefinition } from '../families/basics/definitions.js';
const definition = createBasicsDefinition('greater');
export default function Visualizer() { return <BasicsStory kind="greater" definition={definition} />; }
