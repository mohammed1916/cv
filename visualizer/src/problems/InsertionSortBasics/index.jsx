import BasicsStory from '../families/basics/BasicsStory';
import { createBasicsDefinition } from '../families/basics/definitions.js';
const definition = createBasicsDefinition('insertion');
export default function Visualizer() { return <BasicsStory kind="insertion" definition={definition} />; }
