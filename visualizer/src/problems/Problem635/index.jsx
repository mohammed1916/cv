import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  number: '635',
  phases: [
    { id: 'start', label: 'Empty', description: 'No logs are stored.' },
    { id: 'put', label: 'Store', description: 'Append a log id with its timestamp.' },
    { id: 'retrieve', label: 'Retrieve', description: 'Cut each stamp to the granularity and compare.' },
    { id: 'done', label: 'Result', description: 'Report the last retrieved ids.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with ops: put [id, stamp] or retrieve [start, end, granularity]',
  url: 'https://leetcode.com/problems/design-log-storage-system/',
  complexity: 'O(n) per retrieve, where n is the number of stored logs. The visualization caps the input at 20 operations.',
  examples: [
    { label: 'Day range', input: '{"ops":[["put",1,"2018:03:09:23:59:59"],["put",2,"2018:03:10:22:00:00"],["retrieve","2018:03:09:00:00:00","2018:03:10:23:59:59","Day"]]}' },
    { label: 'Hour range', input: '{"ops":[["put",3,"2016:07:14:10:05:00"],["put",4,"2016:07:14:12:00:00"],["retrieve","2016:07:14:10:00:00","2016:07:14:11:00:00","Hour"]]}' },
  ],
}

export default function DesignLogStorageSystem() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <ul aria-label="Stored logs">{step.state.map((line, index) => <li key={index}>{line}</li>)}</ul>
    <output aria-label="Current step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each stamp is shortened to the chosen unit before the comparison, so a Day query ignores hours, minutes and seconds.</p>
    <p>Keeping the ids in insertion order means a query is one pass over the stored logs.</p>
  </>} />
}
