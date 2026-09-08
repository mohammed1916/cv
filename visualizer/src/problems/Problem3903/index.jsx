import StableIndexWorkspace from '../families/stableIndex/StableIndexWorkspace'
import { createDefinition } from '../families/stableIndex/definition'
const definition = createDefinition({ maxLength: 100, slug: 'smallest-stable-index-i' })
export default function SmallestStableIndexI() { return <StableIndexWorkspace definition={definition} /> }
