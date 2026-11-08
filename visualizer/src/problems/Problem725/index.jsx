import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sizes', description: 'Work out the base size and the extra nodes.' },
    { id: 'cut', label: 'Cut part', description: 'Take the next run of nodes as one part.' },
    { id: 'done', label: 'Complete', description: 'Return all parts, empty ones included.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'values and k (JSON object)',
  url: 'https://leetcode.com/problems/split-linked-list-in-parts/',
  complexity: 'O(n + k) time for the walk and the cuts; the parts reuse the existing nodes.',
  examples: [
    { label: 'Uneven', input: '{"values":[4,8,15,16,23],"k":2}' },
    { label: 'Empty tail', input: '{"values":[7,7,7],"k":4}' },
    { label: 'Even', input: '{"values":[1,3,5,7,9,11],"k":3}' },
    { label: 'Single value', input: '{"values":[9],"k":1}' },
    { label: 'Equal values', input: '{"values":[6,6,6,6],"k":2}' },
    { label: 'Extreme magnitudes', input: '{"values":[1000,-1000],"k":1}' },
    { label: 'Long run: 300 values', input: '{"values":[34,-923,-534,9,144,425,691,702,-348,-536,496,-547,677,906,87,-132,489,-336,716,121,126,185,-362,-527,-749,157,-9,484,193,370,-288,-28,545,-978,-826,237,252,-754,-299,580,-423,-869,-412,-344,866,36,825,-313,-505,-538,141,67,-62,-728,554,391,-665,541,65,-560,-523,805,661,-844,613,10,-721,-879,990,-72,896,-397,522,320,380,-332,-495,-363,290,-587,-226,541,250,-166,217,-995,76,370,-951,312,-701,657,-248,-312,246,-488,83,-101,331,688,67,551,-280,-575,-630,395,-979,336,967,424,152,-353,499,26,45,-660,-753,984,-648,-794,-896,603,801,-631,469,-249,342,281,457,82,784,-255,-652,-773,25,983,-338,-745,572,285,779,142,-511,-731,499,574,435,-718,-528,835,-63,-23,871,-922,579,596,235,757,230,985,893,-522,-998,-121,855,105,67,493,-405,-668,995,-75,-375,-430,787,-559,260,371,237,-862,-510,219,-210,-962,371,-65,-450,-866,812,-504,596,-576,202,544,-745,-539,762,-643,510,-547,21,-414,-841,-555,-651,516,-69,-392,-77,-863,171,-830,58,829,-723,30,287,-103,-460,-434,-882,-205,-468,-315,857,-739,-284,-360,-596,-808,423,644,450,-490,844,818,947,-181,222,-507,-712,123,868,418,85,386,-828,-127,-44,225,-723,253,-768,510,539,134,983,-852,468,349,-730,-151,-719,126,-955,-874,730,-208,572,-647,359,-897,-192,110,859,704,640,646,654,767,-629,708,398,-663,384,-474,522,-585,362,-749,-503,301,-993,-404,969,-760,631,992,408,-96],"k":20}' },
  ],
}

export default function SplitLinkedList() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="List nodes (the part being cut is marked)" length={run.input.values.length} active={step.cuts?.[0] ?? -1}
      valueAt={i => run.input.values[i]}
      roleAt={i => (step.cuts && i >= step.cuts[0] && i < step.cuts[1] ? 'part ' + step.part : '')} />
    <ol aria-label="Parts so far">{step.parts.map((part, index) => <li key={index}>{`Part ${index}: [${part.join(', ')}]`}</li>)}</ol>
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Every part gets the same base size. The first remainder parts take one extra node so sizes differ by at most one and the earlier parts are never smaller.</p>
    <p>Parts are consecutive runs in the original order, and when there are more parts than nodes the trailing parts are empty.</p>
  </>} />
}
