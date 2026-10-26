// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Robots choose between rich edges and shared interior cells",
    "input": "{\"grid\":[[4,1,2,6],[2,8,3,1],[5,2,9,4],[1,7,2,8],[6,3,5,2]]}"
  },
  {
    "label": "An all-zero board yields zero cherries",
    "input": "{\"grid\":[[0,0,0],[0,0,0],[0,0,0]]}"
  },
  {
    "label": "Two columns allow both robots to collect every row",
    "input": "{\"grid\":[[2,5],[7,3],[4,6]]}"
  },
  {
    "label": "A valuable center cell must not be counted twice",
    "input": "{\"grid\":[[1,0,1],[0,20,0],[0,0,0]]}"
  }
];
