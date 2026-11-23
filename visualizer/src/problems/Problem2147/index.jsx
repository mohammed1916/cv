import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2147',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Corridor string of S (seat) and P (plant)',
  url: 'https://leetcode.com/problems/number-of-ways-to-divide-a-long-corridor/',
  complexity: 'O(n) time for the scan and the gap product; O(number of seats) space for the seat positions.',
  question: "Count the ways to place dividers in a corridor so that every section has exactly two seats.",
  approaches: [
    { name: "Multiply gaps between seat pairs", intuition: "Seats come in pairs; between the second seat of one pair and the first seat of the next, the divider can go in any of the empty cells, so multiply those gap counts.", time: "O(n)", space: "O(1)" },
  ],
  examples: [
    { label: 'Two gaps', input: 'SSPPSPSPSS' },
    { label: 'Odd seats', input: 'SSPPS' },
    { label: 'Adjacent pairs', input: 'SSSS' },
    { label: 'Single seat', input: 'S' },
    { label: 'One pair, plants between', input: 'SPPS' },
    { label: 'Only plants', input: 'PPPP' },
    { label: 'Longest corridor, far apart', input: 'SPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPS' },
    { label: 'Long run: 40 letters', input: 'SPPPSPPSPSSPPSSSPSSSSSPSSPPSPSPSSPPPSSPS' },
  ],
}

export default function Problem2147Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label={`Corridor ${run.input.corridor}`} length={run.input.corridor.length} valueAt={i => run.input.corridor[i]} active={-1} roleAt={i => step.marks[i] ?? ''} />
          <p>Ways so far: {step.ways ?? '–'}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
