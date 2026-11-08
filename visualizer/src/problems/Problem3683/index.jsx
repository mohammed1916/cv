import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'scan', label: 'Tasks', description: 'Compute each task end time.' },
    { id: 'done', label: 'Result', description: 'The smallest end time.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of [start, duration] pairs',
  url: 'https://leetcode.com/problems/earliest-time-to-finish-one-task/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Example', input: '[[4,9],[10,1],[3,20]]' },
    { label: 'Single task', input: '[[50,50]]' },
    { label: 'One task', input: '[[1,1]]' },
    { label: 'Equal starts', input: '[[5,2],[5,2]]' },
    { label: 'Largest values', input: '[[100,100],[1,1]]' },
    { label: 'Long run: 100 tasks', input: '[[1,13],[21,31],[7,95],[9,75],[17,18],[62,95],[26,76],[4,88],[55,93],[39,73],[90,23],[68,90],[25,44],[10,59],[79,43],[49,25],[1,32],[46,3],[97,24],[87,89],[13,41],[26,31],[80,41],[7,54],[54,68],[32,81],[68,56],[79,100],[69,27],[15,75],[21,20],[96,43],[28,79],[66,3],[51,77],[78,15],[21,21],[3,52],[2,91],[53,96],[2,27],[9,21],[6,25],[77,30],[92,14],[11,60],[38,97],[74,25],[60,50],[7,75],[8,22],[69,73],[56,88],[44,96],[83,52],[32,30],[30,22],[9,81],[59,7],[44,28],[72,13],[56,100],[80,66],[53,55],[23,14],[64,27],[34,19],[75,15],[96,87],[48,60],[69,89],[50,16],[73,61],[30,97],[61,20],[91,62],[80,80],[85,8],[10,3],[4,94],[71,73],[76,15],[20,4],[26,66],[31,26],[17,96],[3,82],[21,91],[41,56],[26,37],[2,57],[53,85],[51,84],[85,20],[27,85],[86,28],[11,56],[57,44],[49,69],[60,16]]' },
  ],
}

export default function EarliestTimeToFinishOneTask() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="tasks" length={run.input.tasks.length} valueAt={i => `[${run.input.tasks[i].join(', ')}]`} active={step.at}
      roleAt={i => (i === step.bestIndex ? 'best' : '')} />
    <output aria-label="Best finish">{step.finish === null ? `earliest finish ${step.best}` : `task ends at ${step.finish}; best ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>A task finishes once start plus duration units have passed. Nothing else matters for this question, so the answer is the smallest such sum.</p>
    <p>Tracking a running minimum lets one pass over the list answer it.</p>
  </>} />
}
