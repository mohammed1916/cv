// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Candidate cars merge into fleets before a rear car can reach them",
    "input": "{\"cars\":[[2,7],[7,4],[13,6],[18,3],[26,5],[35,2]]}"
  },
  {
    "label": "Increasing speeds never collide",
    "input": "{\"cars\":[[1,2],[5,4],[12,6],[20,8]]}"
  },
  {
    "label": "Equal speeds preserve all separations",
    "input": "{\"cars\":[[3,5],[9,5],[16,5]]}"
  },
  {
    "label": "Two cars can meet at a fractional time",
    "input": "{\"cars\":[[4,8],[15,5]]}"
  }
];
