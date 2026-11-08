import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { parseInput, buildTrace, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Compare the two objects key by key.' },
    { id: 'differ', label: 'Differ', description: 'A key whose values differ is recorded with both values.' },
    { id: 'done', label: 'Result', description: 'The collected differences.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Object with obj1 and obj2 (JSON objects, nesting allowed)',
  url: 'https://leetcode.com/problems/differences-between-two-objects/',
  complexity: 'O(total keys) time. Each key of both objects is compared once.',
  examples: [
    { label: 'Nested change', input: '{"obj1":{"a":1,"nest":{"x":true,"y":[1,2]}},"obj2":{"a":1,"nest":{"x":false,"y":[1,2]},"extra":"new"}}' },
    { label: 'Same objects', input: '{"obj1":{"k":"v"},"obj2":{"k":"v"}}' },
    { label: 'Single key changed', input: '{"obj1":{"a":1},"obj2":{"a":2}}' },
    { label: 'Equal arrays', input: '{"obj1":[1,2,3],"obj2":[1,2,3]}' },
    { label: 'Array length change', input: '{"obj1":[1,2],"obj2":[1,2,3]}' },
    { label: 'Long run: 16 keys', input: '{"obj1":{"k0":9,"k1":4,"k2":1,"k3":6,"k4":3,"k5":0,"k6":5,"k7":2,"k8":7,"k9":4,"k10":9,"k11":6,"k12":1,"k13":8,"k14":3,"k15":0},"obj2":{"k0":10,"k1":4,"k2":1,"k3":7,"k4":3,"k5":0,"k6":6,"k7":2,"k8":7,"k9":5,"k10":9,"k11":6,"k12":2,"k13":8,"k14":3,"k15":1}}' },
    { label: 'Single key changed', input: '{"obj1":{"a":1},"obj2":{"a":2}}' },
    { label: 'Equal arrays', input: '{"obj1":[1,2,3],"obj2":[1,2,3]}' },
    { label: 'Array length change', input: '{"obj1":[1,2],"obj2":[1,2,3]}' },
    { label: 'Long run: 16 keys', input: '{"obj1":{"k0":9,"k1":4,"k2":1,"k3":6,"k4":3,"k5":0,"k6":5,"k7":2,"k8":7,"k9":4,"k10":9,"k11":6,"k12":1,"k13":8,"k14":3,"k15":0},"obj2":{"k0":10,"k1":4,"k2":1,"k3":7,"k4":3,"k5":0,"k6":6,"k7":2,"k8":7,"k9":5,"k10":9,"k11":6,"k12":2,"k13":8,"k14":3,"k15":1}}' },
  ],
}

export default function DifferencesBetweenTwoObjects() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    // Each differing key is one row: its path, the value in obj1, and the value in obj2.
    const rows = Object.entries(step.diff ?? {}).map(([path, [x, y]]) => ({ path, obj1: JSON.stringify(x ?? null), obj2: JSON.stringify(y ?? null) }))
    const current = rows.length - 1
    return <section aria-label="Differences" style={{ display: 'grid', gap: 10 }}>
      <RecordStateTable label="Keys that differ" columns={['path', 'obj1', 'obj2']} rows={rows} activeRow={step.phase === 'differ' ? current : -1} />
      {step.phase === 'done' && <pre style={{ color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{JSON.stringify(run.result)}</pre>}
    </section>
  }} renderReasoning={({ step }) => <p>{step.message ?? 'Keys present on only one side are compared against undefined.'}</p>} />
}
