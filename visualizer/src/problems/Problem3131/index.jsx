import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Minimums', description: 'Find the smallest value in each array.' },
    { id: 'done', label: 'Result', description: 'The difference is the added integer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums1 and nums2 (equal-length integer arrays)',
  url: 'https://leetcode.com/problems/find-the-integer-added-to-array-i/',
  complexity: 'O(n) time to find the two minimums.',
  examples: [
    { label: 'Own case 1', input: '{"nums1":[3,7,5],"nums2":[10,8,6]}' },
    { label: 'Own case 2', input: '{"nums1":[11],"nums2":[6]}' },
    { label: "Single pair", input: "{\"nums1\":[1],\"nums2\":[1]}" },
    { label: "Equal pairs", input: "{\"nums1\":[4,4],\"nums2\":[4,4]}" },
    { label: "Extreme values, 100 pairs", input: "{\"nums1\":[-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000],\"nums2\":[1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000]}" },
    { label: "Long run: 100 pairs", input: "{\"nums1\":[903,-890,383,-342,279,122,-452,-786,-286,-705,130,430,-204,-460,192,-232,-214,-21,-778,75,-777,517,-70,642,-522,-376,-945,164,-206,-486,657,-93,-909,-7,101,-437,547,-24,-161,869,403,-203,433,-809,-190,-715,444,693,-143,-163,810,80,-800,-985,703,-85,499,-966,25,312,-298,729,635,-90,645,-246,158,-78,291,-736,-448,551,671,-897,320,218,182,-622,64,518,-606,866,-385,-53,-837,-787,207,-201,-971,524,-715,801,242,-481,503,381,852,-195,-392,192],\"nums2\":[143,-694,-200,-414,-138,-799,-447,-202,125,-981,300,-852,194,238,506,522,-696,345,-465,275,-514,-52,-368,529,523,-892,252,-670,-428,-934,688,821,-359,-306,-788,-488,793,-428,863,769,-455,782,-985,-627,852,836,644,-589,-164,-83,-474,879,-473,-29,172,-172,576,-566,-595,539,581,-948,-958,361,-770,-593,-950,-808,-709,306,831,-372,813,-933,493,-250,534,-523,-284,-329,336,596,307,-413,939,-792,750,-422,-219,922,561,13,-664,-557,844,585,-395,-531,93,-955]}" },
  ],
}

export default function AddedIntegerI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const sorted1 = [...run.input.nums1].sort((a, b) => a - b)
    const sorted2 = [...run.input.nums2].sort((a, b) => a - b)
    const x = step.x
    const rows = sorted1.map((value, k) => ({
      'smallest first': k,
      'nums1 sorted': value,
      'nums1 plus x': x === null ? '—' : value + x,
      'nums2 sorted': sorted2[k],
    }))
    return <>
      <RecordStateTable label="Sorted arrays side by side" columns={['smallest first', 'nums1 sorted', 'nums1 plus x', 'nums2 sorted']} rows={rows} activeRow={0} />
      <output aria-label="Minimums">{`min(nums1) = ${step.min1}, min(nums2) = ${step.min2}`}</output>
      <output aria-label="Added integer">{x === null ? 'x not yet known' : `x = ${x}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>If adding x to every value of nums1 gives nums2 as a multiset, the smallest value of nums1 plus x must be the smallest value of nums2. Once sorted, the two columns line up one row at a time.</p>
  </>} />
}
