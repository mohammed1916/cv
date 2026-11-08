import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Search range', description: 'Left ends of valid windows lie between lo and hi.' },
    { id: 'probe', label: 'Test the middle', description: 'Compare the two edges of the window starting at mid.' },
    { id: 'done', label: 'Window', description: 'The k values starting at lo are the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Sorted array, k and x (JSON object)',
  url: 'https://leetcode.com/problems/find-k-closest-elements/',
  complexity: 'O(log(n − k) + k) time: a binary search for the left end, then copying the window.',
  examples: [
    { label: 'Middle', input: '{"arr":[1,3,5,7,9,11],"k":3,"x":6}' },
    { label: 'Left edge', input: '{"arr":[2,4,6,8],"k":2,"x":-5}' },
    { label: 'Duplicate', input: '{"arr":[1,2,2,2,3],"k":2,"x":2}' },
    { label: 'One value', input: '{"arr":[4],"k":1,"x":0}' },
    { label: 'Equal distance prefers smaller', input: '{"arr":[1,2,3,4,5],"k":2,"x":3}' },
    { label: 'Extreme values', input: '{"arr":[-10000,10000],"k":1,"x":10000}' },
    { label: 'Long run: 200 values', input: '{"arr":[-9883,-9705,-9623,-9395,-9328,-9275,-9268,-9183,-9162,-9035,-9018,-8969,-8498,-8285,-8283,-8188,-7858,-7828,-7756,-7653,-7559,-7470,-7370,-7319,-6969,-6968,-6930,-6903,-6837,-6186,-6145,-6056,-5848,-5809,-5789,-5676,-5559,-5522,-5376,-5136,-4992,-4971,-4737,-4297,-4278,-4112,-4059,-4010,-3907,-3834,-3524,-3398,-3171,-3027,-2970,-2737,-2378,-2269,-2232,-2178,-2125,-1853,-1663,-1626,-1467,-1465,-1383,-1380,-1223,-1178,-1092,-899,-715,-705,-658,-616,-462,-404,-373,-349,-332,-133,13,28,69,121,189,659,738,742,750,867,986,1002,1113,1179,1323,1339,1460,1762,1784,1862,1984,2108,2170,2232,2296,2402,2544,2623,2645,3255,3313,3344,3463,3520,3565,3595,3605,3739,3772,3776,3791,3800,3897,3970,4024,4040,4056,4075,4083,4137,4210,4243,4470,4509,4533,4568,4600,4602,4732,4771,4789,4911,4973,5073,5180,5313,5400,5481,5556,5732,5814,5836,5907,5989,5991,6081,6134,6191,6208,6318,6502,6611,6647,6723,6734,6875,6947,7082,7219,7390,7489,7502,7612,7642,7693,7791,7815,7846,7927,8098,8297,8367,8449,8595,8689,8740,8985,9007,9027,9246,9291,9533,9703,9748,9814,9846,9849,9936],"k":50,"x":37}' },
  ],
}

export default function FindKClosest() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { arr, k, x } = run.input
    const lo = step.lo
    const hi = step.hi
    const roleAt = i => {
      const tags = []
      if (step.mid !== null && i === step.mid) tags.push('mid')
      if (i === lo) tags.push('lo')
      if (step.phase === 'done' ? i >= lo && i <= lo + k - 1 : i === hi) tags.push(step.phase === 'done' ? 'answer' : 'hi')
      return tags.join(' · ')
    }
    return <>
      <IndexedSequence label={`Sorted values, target x = ${x}`} length={arr.length} active={step.mid ?? -1} valueAt={i => arr[i]} roleAt={roleAt} />
      <output aria-label="Search range">{`Search range lo ${lo} to hi ${hi}${step.mid !== null && step.mid !== undefined ? `; testing mid ${step.mid}` : ''}; window length ${k}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why binary search:</strong> the best window is contiguous, so its left end is the only number to find; the test at mid tells which half must contain it.</p>
  </>} />
}
