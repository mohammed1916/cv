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
    { label: 'Cycle never starts', input: '{"recipes":["a","b"],"ingredients":[["b"],["a"]],"supplies":["x"]}' },
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
