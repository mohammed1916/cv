import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import StableIndexWorkspace from '../families/stableIndex/StableIndexWorkspace'
import { createDefinition } from '../families/stableIndex/definition'
const definition = createDefinition({ maxLength: 100000, slug: 'smallest-stable-index-ii' })
function SmallestStableIndexII() { return <StableIndexWorkspace definition={definition} /> }

export default withProblemStory(SmallestStableIndexII, storyGuide);
