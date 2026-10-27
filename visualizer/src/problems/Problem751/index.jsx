import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'First address', description: 'Begin at the first address of the range.' },
    { id: 'block', label: 'Largest block', description: 'Take the biggest aligned block that still fits.' },
    { id: 'done', label: 'Covered', description: 'All addresses are covered by the blocks.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'ip and n (JSON)',
  url: 'https://leetcode.com/problems/ip-to-cidr/',
  complexity: 'O(log n) blocks of work each. The visualization accepts up to 1000 addresses.',
  examples: [
    { label: 'Example 1', input: '{"ip":"255.0.0.7","n":10}' },
    { label: 'One block', input: '{"ip":"10.0.0.0","n":256}' },
  ],
}

export default function IpToCidr() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="CIDR blocks so far" length={step.blocks.length} active={step.blocks.length - 1} valueAt={i => step.blocks[i]} />
    <output aria-label="Remaining">{`Next start: ${step.start ?? 'none'}, addresses left: ${step.remaining}`}</output>
  </>} renderReasoning={() => <>
    <p>A CIDR block of 2^k addresses must start at a multiple of 2^k. So from the current address, the block can be no larger than the lowest set bit allows, and no larger than what remains.</p>
    <p>Taking the largest such block each time gives the fewest blocks.</p>
  </>} />
}
