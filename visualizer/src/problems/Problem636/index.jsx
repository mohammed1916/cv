import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Call', description: 'Push a function; the caller pauses.' },
    { id: 'end', label: 'Return', description: 'Pop the function and add its time.' },
    { id: 'done', label: 'Complete', description: 'Return the exclusive times.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Program (JSON object with n and logs)',
  url: 'https://leetcode.com/problems/exclusive-time-of-functions/',
  complexity: 'O(logs + n) time and O(logs) stack space.',
  examples: [
    { label: 'Nested', input: '{"n":2,"logs":["0:start:0","1:start:2","1:end:5","0:end:6"]}' },
    { label: 'Recursion', input: '{"n":1,"logs":["0:start:0","0:start:2","0:end:5","0:start:6","0:end:6","0:end:7"]}' },
    { label: 'Back to back', input: '{"n":2,"logs":["0:start:0","0:end:0","1:start:1","1:end:1"]}' },
    { label: 'Single call', input: '{"n":1,"logs":["0:start:0","0:end:1"]}' },
    { label: 'Same timestamp nesting', input: '{"n":2,"logs":["0:start:4","1:start:4","1:end:4","0:end:4"]}' },
    { label: 'Largest id and time', input: '{"n":100,"logs":["99:start:0","99:end:1000000"]}' },
    { label: 'Long run: 200 log entries', input: '{"n":50,"logs":["0:start:0","3:start:0","3:end:1","10:start:2","10:end:4","44:start:5","26:start:6","26:end:8","44:end:10","15:start:12","37:start:13","37:end:15","35:start:15","24:start:15","7:start:15","31:start:17","18:start:19","28:start:19","28:end:19","20:start:19","20:end:20","10:start:20","10:end:22","2:start:22","2:end:22","12:start:22","12:end:24","45:start:26","45:end:28","18:end:30","12:start:31","21:start:33","21:end:34","9:start:36","9:end:37","36:start:37","36:end:39","39:start:41","39:end:43","8:start:43","8:end:43","12:end:45","0:start:45","27:start:45","27:end:45","42:start:46","42:end:46","8:start:48","8:end:48","6:start:49","6:end:50","10:start:50","10:end:52","0:end:52","33:start:52","32:start:54","32:end:55","45:start:57","45:end:59","42:start:61","42:end:61","33:end:61","11:start:62","11:end:64","9:start:64","5:start:66","5:end:68","9:end:69","31:end:69","19:start:71","18:start:71","37:start:71","37:end:71","35:start:71","35:end:72","25:start:73","25:end:73","18:end:74","19:end:74","43:start:75","41:start:77","25:start:79","25:end:79","41:end:80","6:start:81","6:end:82","38:start:83","31:start:85","31:end:85","35:start:86","35:end:87","28:start:89","28:end:91","38:end:91","35:start:91","35:end:92","46:start:93","47:start:95","47:end:97","27:start:98","27:end:99","15:start:101","15:end:103","43:start:105","43:end:105","46:end:107","7:start:109","7:end:111","43:end:111","0:start:112","45:start:113","28:start:114","28:end:116","18:start:117","18:end:118","45:end:120","35:start:122","35:end:123","8:start:124","8:end:124","0:end:126","7:end:128","24:end:128","0:start:128","2:start:130","6:start:131","14:start:131","42:start:131","42:end:133","16:start:133","16:end:135","14:end:135","39:start:136","3:start:137","3:end:139","12:start:139","12:end:140","39:end:141","47:start:141","47:end:141","23:start:143","23:end:145","6:end:146","38:start:146","38:end:146","2:start:147","24:start:148","9:start:148","9:end:150","24:end:150","4:start:151","39:start:153","39:end:154","4:end:155","48:start:157","48:end:159","2:end:160","13:start:160","13:end:160","2:end:162","0:end:163","35:end:163","38:start:163","38:end:164","15:end:164","21:start:164","8:start:165","49:start:165","5:start:167","14:start:169","34:start:171","14:start:171","14:end:173","34:end:175","14:end:177","5:end:179","21:start:180","44:start:181","28:start:182","28:end:182","17:start:182","17:end:184","46:start:186","14:start:188","14:end:190","46:end:190","44:end:190","26:start:192","6:start:193","45:start:194","45:end:194","2:start:195","2:end:195","6:end:195","26:end:196","21:end:196","49:end:196","8:end:197","21:end:198","0:end:198"]}' },
  ],
}

export default function ExclusiveTime() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <StackLane title="Call stack" items={step.stack.map(id => `f${id}`)} note={step.stack.length ? 'top is running' : 'idle'} />
    <IndexedSequence label="Exclusive time per function" length={run.input.n} active={step.current ?? -1} valueAt={i => step.result[i]}
      roleAt={i => (i === step.current ? 'current' : '')} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Exclusive time:</strong> a function accumulates time only while it is on top; a call pauses its caller until the callee ends.</p>
  </>} />
}
