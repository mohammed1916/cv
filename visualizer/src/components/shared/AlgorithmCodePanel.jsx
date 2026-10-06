import { useState } from 'react'
import CodeTracePanel from '../CodeTracePanel'

// Language changes only affect the code view, never the running visualization.
export default function AlgorithmCodePanel({ definition, step, input }) {
  const [preferredLanguage, setPreferredLanguage] = useState('python')
  const hasPython = typeof definition.python === 'string' && definition.python.trim().length > 0
  const hasSql = typeof definition.sql === 'string' && definition.sql.trim().length > 0
  const language = preferredLanguage === 'sql' && hasSql ? 'sql' : preferredLanguage === 'python' && hasPython ? 'python' : 'pseudocode'
  const pythonLine = definition.pythonStages?.[step?.codeStage]
  const codeLines = language !== 'pseudocode'
    ? definition[language].trim().split('\n').map((text, index) => ({ line: index + 1, text }))
    : definition.code
  let playgroundInput
  try { playgroundInput = JSON.parse(input) } catch { /* Keep an invalid draft out of the executable handoff. */ }

  return <div className="algorithm-workspace__code">
    <div className="algorithm-workspace__languages" role="group" aria-label="Code language">
      <button type="button" aria-pressed={language === 'python'} disabled={!hasPython}
        title={hasPython ? 'Show the complete Python solution' : 'Python implementation has not been added to this problem yet'}
        onClick={() => setPreferredLanguage('python')}>Python</button>
      <button type="button" aria-pressed={language === 'pseudocode'}
        onClick={() => setPreferredLanguage('pseudocode')}>Pseudocode</button>
      {hasSql && <button type="button" aria-pressed={language === 'sql'} onClick={() => setPreferredLanguage('sql')}>SQL</button>}
    </div>
    {!hasPython && <p className="algorithm-workspace__code-note">Python implementation is not available for this problem yet.</p>}
    <CodeTracePanel key={language} codeLines={codeLines}
      step={language === 'pseudocode' ? step : language === 'python' && pythonLine ? { ...step, activeLine: pythonLine } : undefined}
      title={language === 'python' ? 'Python solution' : language === 'sql' ? 'SQL solution' : 'Pseudocode'}
      subtitle={language === 'sql' ? 'MySQL query: run against the table shown in the input view.' : language === 'python' && !pythonLine ? 'Complete Python implementation · use the JSON input fields as function arguments.' : null}
      playgroundInput={playgroundInput} playgroundDisabled={language !== 'python' || playgroundInput === undefined} disableResizer />
  </div>
}
