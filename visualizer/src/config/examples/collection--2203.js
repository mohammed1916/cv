// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "The cheapest joint subgraph shares a suffix after an intermediate merge",
    "input": "{\"n\":8,\"edges\":[[0,2,4],[1,2,3],[0,3,2],[1,4,2],[3,5,5],[4,5,4],[2,5,1],[5,6,3],[6,7,2],[2,7,12],[4,7,15]],\"src1\":0,\"src2\":1,\"dest\":7}"
  },
  {
    "label": "One source can join the other source before traveling onward",
    "input": "{\"n\":4,\"edges\":[[0,1,2],[1,2,3],[2,3,4],[0,3,20]],\"src1\":0,\"src2\":1,\"dest\":3}"
  },
  {
    "label": "A source with no route makes the joint subgraph impossible",
    "input": "{\"n\":5,\"edges\":[[0,2,1],[2,4,2],[1,3,3]],\"src1\":0,\"src2\":1,\"dest\":4}"
  },
  {
    "label": "Independent routes may meet only at the destination",
    "input": "{\"n\":5,\"edges\":[[0,2,4],[2,4,5],[1,3,2],[3,4,6]],\"src1\":0,\"src2\":1,\"dest\":4}"
  }
];
