import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import Problem3860View from './Problem3860View'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No groups exist yet.' },
    { id: 'read', label: 'Lowercase', description: 'Lowercase the whole address.' },
    { id: 'strip', label: 'Local part', description: 'Drop dots and cut at the first plus.' },
    { id: 'new', label: 'New group', description: 'This key has not been seen.' },
    { id: 'seen', label: 'Repeat', description: 'This key is already counted.' },
    { id: 'done', label: 'Answer', description: 'Report the number of groups.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with an emails list of addresses',
  url: 'https://leetcode.com/problems/unique-email-groups/',
  complexity: 'O(total length) time and O(number of distinct keys) space. Each address is normalized once. The visualization caps the list at 12 addresses.',
  examples: [
    { label: 'Dots and plus', input: '{"emails":["Lee.Ann+work@Mail.com","leeann@mail.com","LEE.A.N.N+x@mail.COM","ann@mail.com.au"]}' },
    { label: 'Domain dots matter', input: '{"emails":["x.y.z+1@A.io","xyz@a.IO","xy+z@a.io","x.yz@b.io"]}' },
  ],
}

export default function Problem3860Visualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <Problem3860View run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Two addresses belong to one group exactly when their normalized strings are equal, so a set of keys counts the groups.</p>
  </>} />
}
