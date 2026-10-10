import BasicsStory from '../families/basics/BasicsStory';
import { createBasicsDefinition } from '../families/basics/definitions.js';
const definition = createBasicsDefinition('gcd');
export default function Visualizer() { return <BasicsStory kind="gcd" definition={definition} />; }
