// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A same-time chain spreads before the next timestamp",
    "input": "{\"n\":9,\"meetings\":[[3,4,5],[2,3,5],[1,2,5],[4,5,8],[6,7,3],[5,6,10],[7,8,12]],\"firstPerson\":1}"
  },
  {
    "label": "Earlier uninformed meetings do not reconnect retroactively",
    "input": "{\"n\":5,\"meetings\":[[2,3,2],[1,2,4],[3,4,6]],\"firstPerson\":1}"
  },
  {
    "label": "Separate same-time components propagate independently",
    "input": "{\"n\":7,\"meetings\":[[1,2,7],[2,3,7],[4,5,7],[5,6,7]],\"firstPerson\":1}"
  },
  {
    "label": "A meeting directly with zero shares the secret",
    "input": "{\"n\":4,\"meetings\":[[0,3,9]],\"firstPerson\":2}"
  }
];
