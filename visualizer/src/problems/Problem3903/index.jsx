import withProblemStory from '../../components/shared/withProblemStory';
import storyGuide from './storyGuide.json';
import StableIndexWorkspace from '../families/stableIndex/StableIndexWorkspace'
import { createDefinition } from '../families/stableIndex/definition'
const definition = createDefinition({ maxLength: 100, slug: 'smallest-stable-index-i' })
function SmallestStableIndexI() { return <StableIndexWorkspace definition={definition} /> }

export default withProblemStory(SmallestStableIndexI, storyGuide);
