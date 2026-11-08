import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2115',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with recipes, ingredients (one list per recipe) and supplies',
  url: 'https://leetcode.com/problems/find-all-possible-recipes-from-given-supplies/',
  complexity: 'O(V + E) for V names and E ingredient links, using a queue of items in stock.',
  examples: [
    { label: 'Chain of recipes', input: '{"recipes":["bread","toast"],"ingredients":[["flour","water"],["bread","jam"]],"supplies":["flour","water","jam"]}' },
    { label: 'Missing item blocks', input: '{"recipes":["soup","stock"],"ingredients":[["stock","salt"],["bone"]],"supplies":["salt","water"]}' },
    { label: 'Cycle never starts', input: '{"recipes":["a","b"],"ingredients":[["b"],["a"]],"supplies":["x"]}' }, { label: "Single recipe", input: "{\"recipes\":[\"a\"],\"ingredients\":[[\"b\"]],\"supplies\":[\"b\"]}" }, { label: "Shared ingredient", input: "{\"recipes\":[\"r1\",\"r2\"],\"ingredients\":[[\"x\"],[\"x\"]],\"supplies\":[\"x\"]}" }, { label: "Ten recipes", input: "{\"recipes\":[\"r0\",\"r1\",\"r2\",\"r3\",\"r4\",\"r5\",\"r6\",\"r7\",\"r8\",\"r9\"],\"ingredients\":[[\"s0\"],[\"s1\"],[\"s2\"],[\"s3\"],[\"s4\"],[\"s5\"],[\"s6\"],[\"s7\"],[\"s8\"],[\"s9\"]],\"supplies\":[\"s0\",\"s1\",\"s2\",\"s3\",\"s4\",\"s5\",\"s6\",\"s7\",\"s8\",\"s9\"]}" }, { label: "Long run: chained recipes", input: "{\"recipes\":[\"r0\",\"r1\",\"r2\",\"r3\",\"r4\",\"r5\",\"r6\",\"r7\",\"r8\",\"r9\"],\"ingredients\":[[\"s4\",\"s6\"],[\"s7\",\"s5\"],[\"s1\"],[\"s2\",\"s3\"],[\"s2\",\"s8\"],[\"r0\",\"s6\"],[\"s1\",\"s2\"],[\"s1\",\"r3\"],[\"r3\",\"s9\"],[\"r5\",\"s4\"]],\"supplies\":[\"s0\",\"s1\",\"s2\",\"s3\",\"s4\",\"s5\",\"s6\",\"s7\",\"s8\",\"s9\"]}" },
  ],
}

export default function Problem2115Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <>
          <RecordStateTable label="Prerequisite map: recipe, ingredients still needed" columns={['recipe', 'needs', 'left', 'status']} rows={step.rows} />
          <p>Item in stock: {step.item ?? '–'} · Made so far: {step.made.join(', ') || 'none'}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
