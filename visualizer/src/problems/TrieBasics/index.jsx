import BasicsStory from '../families/basics/BasicsStory';
import { createBasicsDefinition } from '../families/basics/definitions.js';
const definition = createBasicsDefinition('trie');
export default function Visualizer() { return <BasicsStory kind="trie" definition={definition} />; }
