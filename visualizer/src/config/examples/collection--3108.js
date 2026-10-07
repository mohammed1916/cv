// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Detours clear bits beyond a direct route",
    "input": "{\"n\":7,\"edges\":[[0,1,31],[1,2,27],[2,3,23],[1,4,15],[5,6,12]],\"query\":[[0,3],[4,2],[0,6],[5,6]]}"
  },
  {
    "label": "A zero-weight edge reduces every same-component query to zero",
    "input": "{\"n\":4,\"edges\":[[0,1,22],[1,2,0],[2,3,18]],\"query\":[[0,3],[1,3]]}"
  },
  {
    "label": "Parallel edges both contribute to the component AND",
    "input": "{\"n\":3,\"edges\":[[0,1,14],[0,1,11],[1,2,15]],\"query\":[[0,2],[1,2]]}"
  },
  {
    "label": "Without edges every distinct-endpoint query is unreachable",
    "input": "{\"n\":3,\"edges\":[],\"query\":[[0,1],[1,2]]}"
  }
];
