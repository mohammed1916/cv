import withProblemStory from '../../components/shared/withProblemStory'
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import storyGuide from './storyGuide.json'
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm'

const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap, phases,
  inputLabel: 'Non-negative integers as a JSON array',
  url: 'https://leetcode.com/problems/maximum-gap/',
  complexity: 'O(n) time and O(n) extra space: one pass to place values, one pass over the buckets.',
  examples: [
    { label: 'Spread', input: '[4, 40, 9, 1, 25]' },
    { label: 'Ends', input: '[0, 1000, 500, 250]' },
    { label: 'Equal', input: '[7, 7, 7]' },
  ],
}

function Buckets({ snapshot }) {
  const { buckets, current, size } = snapshot
  return <>
    <p>Bucket width {size}. Each box shows its smallest and largest value.</p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {buckets.map((b, idx) => <div key={idx} data-bucket={idx} data-current={current === idx}
        style={{ minWidth: 70, padding: 6, border: '1px solid currentColor', borderRadius: 6,
          background: current === idx ? '#bae6fd' : b ? 'transparent' : 'rgba(128,128,128,0.12)' }}>
        <small>bucket {idx}</small>
        <div>{b ? `${b.min} – ${b.max}` : 'empty'}</div>
      </div>)}
    </div>
  </>
}

function WidestBucketGap() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <Buckets snapshot={step.snapshot} />
    <output aria-label="Widest gap so far">Widest gap: {step.snapshot.best ?? 0}</output>
  </>} renderReasoning={() => <>
    <p>Values inside one bucket are closer than the bucket width, so the widest gap always falls between two buckets.</p>
    <p>That lets each bucket remember only its minimum and maximum, instead of sorting every value.</p>
  </>} />
}

export default withProblemStory(WidestBucketGap, storyGuide)
