import BasicsStory from '../families/basics/BasicsStory';
import { createBasicsDefinition } from '../families/basics/definitions.js';
const definition = createBasicsDefinition('linear');
export default function Visualizer() { return <BasicsStory kind="linear" definition={definition} />; }
