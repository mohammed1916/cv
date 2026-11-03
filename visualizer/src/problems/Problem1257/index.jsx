import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ContainmentTreeView from './ContainmentTreeView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Parents', description: 'Record which region lists each child.' },
    { id: 'mark', label: 'Mark', description: 'Mark region1 and every region above it.' },
    { id: 'second', label: 'Start', description: 'Begin climbing from region2.' },
    { id: 'check', label: 'Check', description: 'Test whether the current region is marked.' },
    { id: 'climb', label: 'Climb', description: 'Move the current region up one level.' },
    { id: 'found', label: 'Found', description: 'The first marked region is the answer.' },
    { id: 'done', label: 'Result', description: 'Report the smallest common region.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with regions (rows of parent then children), region1 and region2',
  url: 'https://leetcode.com/problems/smallest-common-region/',
  complexity: 'O(n) time and space for n region names. The visualization caps the tree at 14 names.',
  examples: [
    { label: 'Cousins in the coast', input: '{"regions":[["Continent","Coast","Inland"],["Coast","Harbour","Dockyard"],["Inland","Valley","Plateau","Mesa"]],"region1":"Dockyard","region2":"Mesa"}' },
    { label: 'Siblings', input: '{"regions":[["Continent","Coast","Inland"],["Inland","Valley","Plateau","Mesa"]],"region1":"Valley","region2":"Plateau"}' },
    { label: 'Ancestor is the answer', input: '{"regions":[["Atlas","Summit","Basin"],["Summit","Ridge"]],"region1":"Ridge","region2":"Summit"}' },
  ],
}

export default function SmallestCommonRegion() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <ContainmentTreeView run={run} step={step} />}
    renderReasoning={({ step }) => <p>{step.message}</p>} />
}
