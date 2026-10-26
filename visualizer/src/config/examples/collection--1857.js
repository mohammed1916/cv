// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Merging paths carry competing color totals",
    "input": "{\"colors\":\"abacabad\",\"edges\":[[0,1],[0,2],[1,3],[2,3],[2,4],[3,5],[4,5],[5,6],[6,7]]}"
  },
  {
    "label": "Self-loop is a cycle",
    "input": "{\"colors\":\"a\",\"edges\":[[0,0]]}"
  },
  {
    "label": "Disconnected DAG components",
    "input": "{\"colors\":\"abbaa\",\"edges\":[[0,1],[2,3],[3,4]]}"
  },
  {
    "label": "A cycle hidden beside an acyclic component",
    "input": "{\"colors\":\"abcd\",\"edges\":[[0,1],[2,3],[3,2]]}"
  }
];
