// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Indirect components make later requests invalid",
    "input": "{\"n\":8,\"restrictions\":[[0,5],[2,6],[3,7]],\"requests\":[[0,1],[1,2],[4,5],[2,4],[3,6],[1,6],[5,7],[0,2]]}"
  },
  {
    "label": "A direct restricted pair is rejected",
    "input": "{\"n\":3,\"restrictions\":[[0,2]],\"requests\":[[0,2],[0,1],[1,2]]}"
  },
  {
    "label": "Repeated friendships inside one component are accepted",
    "input": "{\"n\":4,\"restrictions\":[],\"requests\":[[0,1],[1,2],[0,2],[2,3],[0,3]]}"
  },
  {
    "label": "A rejected request must not partially merge components",
    "input": "{\"n\":4,\"restrictions\":[[0,3]],\"requests\":[[0,1],[2,3],[1,2],[0,2]]}"
  }
];
