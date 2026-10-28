import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import OperationLog from '../../components/shared/OperationLog'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No tweets are recorded yet.' },
    { id: 'record', label: 'Record', description: 'Insert the time into this name’s sorted list.' },
    { id: 'bucket', label: 'Bucket', description: 'Count the recorded times inside one bucket.' },
    { id: 'query', label: 'Query', description: 'Return the bucket counts for this query.' },
    { id: 'done', label: 'Complete', description: 'Report every query result.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: {"ops": [["record", name, time], ["query", freq, name, start, end]]}',
  url: 'https://leetcode.com/problems/tweet-counts-per-frequency/',
  complexity: 'Each record is a sorted insert and each bucket is two binary searches. The visualization caps times at 200 and operations at 12.',
  examples: [
    { label: 'Example 1', input: '{"ops":[["record","tweet",0],["record","tweet",60],["record","tweet",10],["query","minute","tweet",0,59],["query","minute","tweet",0,60]]}' },
  ],
}

export default function TweetCounts() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <OperationLog title="Operations" ops={run.log} current={step.op ?? -1} />
    <output aria-label="Buckets">{step.bucket ? `Bucket ${step.bucket[0]} to ${step.bucket[1]}; counts so far ${JSON.stringify(step.counts)}` : `Counts: ${JSON.stringify(step.counts)}`}</output>
  </>} renderReasoning={() => <>
    <p>Each name keeps its times sorted, so counting a time window needs only the position where it starts and the position where it ends.</p>
    <p>A frequency splits the query window into consecutive buckets, and each bucket is one pair of binary searches.</p>
  </>} />
}
