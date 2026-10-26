import BasicsStory from '../families/basics/BasicsStory';
import { createBasicsDefinition } from '../families/basics/definitions.js';
const definition = createBasicsDefinition('heap');
export default function Visualizer() { return <BasicsStory kind="heap" definition={definition} />; }
