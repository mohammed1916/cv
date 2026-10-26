import { useState } from 'react';
import CodeTracePanel from '../components/CodeTracePanel';

const code = [
  { line: 1, text: 'for i, value in enumerate(nums):' },
  { line: 2, text: '    need = target - value' },
  { line: 3, text: '    if need in seen:' },
  { line: 4, text: '        return [seen[need], i]' },
  { line: 5, text: '    seen[value] = i' },
];

export default function TutorialSelectionPractice() {
  const [line, setLine] = useState(2);
  return <section className="tutorial-selection-practice" data-chat-ignore aria-label="Practise code selection">
    <ol><li>Turn <strong>Select mode</strong> on below.</li><li>Click line 2, then Shift-click line 4 to select a block. Click any line again to remove it.</li><li>Choose <strong>Try attaching</strong>. This is a practice area; nothing is sent to AI.</li></ol>
    <CodeTracePanel codeLines={code} step={{ activeLine: line }} title="Two Sum · practice code" selectionPractice disableResizer playgroundLaunch={<></>} />
    <button type="button" onClick={() => setLine(value => value === 5 ? 1 : value + 1)}>Advance example execution</button>
    <p>Your selection stays highlighted separately from the moving execution line. In a real workspace, use Attach to chat, review the attached code, write a question, then send.</p>
  </section>;
}
