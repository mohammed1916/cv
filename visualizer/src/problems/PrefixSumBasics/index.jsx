import BasicsStory from '../families/basics/BasicsStory';
import { createBasicsDefinition } from '../families/basics/definitions.js';
const definition = createBasicsDefinition('prefix');
export default function Visualizer() { return <BasicsStory kind="prefix" definition={definition} />; }
