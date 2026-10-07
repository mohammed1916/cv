// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Overlapping and adjacent ranges extend coverage",
    "input": "{\"ranges\":[[8,12],[2,5],[5,7],[14,18],[11,15]],\"left\":3,\"right\":17}"
  },
  {
    "label": "One integer gap prevents coverage",
    "input": "{\"ranges\":[[1,4],[6,9]],\"left\":2,\"right\":8}"
  },
  {
    "label": "Single point exactly covered",
    "input": "{\"ranges\":[[7,7]],\"left\":7,\"right\":7}"
  },
  {
    "label": "Ranges beyond target do not help",
    "input": "{\"ranges\":[[2,3],[10,15]],\"left\":4,\"right\":6}"
  }
];
