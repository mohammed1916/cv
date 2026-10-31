const dirs = ["Problem2552","Problem2606","Problem2617","Problem2745","Problem2750","Problem2963","Problem3101","Problem3287","Problem3290"];
const examples = {
  Problem2552: [{nums:[1,3,2,4,5]},{nums:[1,2,3,4]}],
  Problem2606: [{s:"adaa",chars:"d",vals:[-1000]},{s:"abc",chars:"abc",vals:[-1,-1,-1]}],
  Problem2617: [{grid:[[3,4,2,1],[4,2,3,1],[2,1,0,0],[2,4,0,0]]},{grid:[[3,4,2,1],[4,2,1,1],[2,1,1,0],[3,4,1,0]]},{grid:[[2,1,0],[1,0,0]]}],
  Problem2745: [{x:2,y:5,z:1},{x:3,y:2,z:2}],
  Problem2750: [{nums:[0,1,0,0,1]},{nums:[0,1,0]}],
  Problem2963: [{nums:[1,2,3,4]},{nums:[1,1,1,1]},{nums:[1,2,1,3]}],
  Problem3101: [{nums:[0,1,1,1]},{nums:[1,0,1,0]}],
  Problem3287: [{nums:[4,2,5,6,7],k:2},{nums:[2,6,7],k:1}],
  Problem3290: [{a:[3,2,5,6],b:[2,-6,4,-5,-3,2,-7]},{a:[-1,4,5,-2],b:[-5,-1,-3,-2,-4]}],
};
const out = {};
for (const d of dirs) {
  const m = await import(`/Volumes/S/Development/a/competitive_programming_visualisations/visualizer/src/problems/${d}/algorithm.js`);
  const fnName = { Problem2552:"countIncreasingQuadruplets",Problem2606:"maximumCostSubstring",Problem2617:"minVisitedCells",Problem2745:"longestNewString",Problem2750:"goodSplits",Problem2963:"countGoodPartitions",Problem3101:"countAlternatingSubarrays",Problem3287:"maxSequenceValue",Problem3290:"maxMultiplicationScore" }[d];
  out[d] = { python: m.python, fn: fnName, cases: examples[d].map(inp => ({ input: inp, expected: m.buildTrace(m.parseInput(JSON.stringify(inp))).result })) };
}
console.log(JSON.stringify(out));
