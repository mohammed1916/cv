import StableIndexWorkspace from '../families/stableIndex/StableIndexWorkspace'
import { createDefinition } from '../families/stableIndex/definition'
const definition = createDefinition({ maxLength: 100000, slug: 'smallest-stable-index-ii' })
export default function SmallestStableIndexII() { return <StableIndexWorkspace definition={definition} /> }
