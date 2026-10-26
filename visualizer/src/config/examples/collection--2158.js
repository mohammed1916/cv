// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Overlapping days fill gaps and skip previously painted segments",
    "input": "{\"paint\":[[2,8],[5,12],[0,4],[15,19],[10,17],[0,20]]}"
  },
  {
    "label": "Repeating the same interval adds nothing after day one",
    "input": "{\"paint\":[[4,11],[4,11],[4,11]]}"
  },
  {
    "label": "Touching intervals share no positive-length overlap",
    "input": "{\"paint\":[[0,3],[3,7],[7,12]]}"
  },
  {
    "label": "A nested later interval is already fully painted",
    "input": "{\"paint\":[[1,20],[5,8],[2,19]]}"
  }
];
