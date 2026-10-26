import BasicsStory from '../families/basics/BasicsStory';
import { createBasicsDefinition } from '../families/basics/definitions.js';
const definition = createBasicsDefinition('histogram');
export default function Visualizer() { return <BasicsStory kind="histogram" definition={definition} />; }
