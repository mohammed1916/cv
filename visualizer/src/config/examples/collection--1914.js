// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different ring lengths use different reduced shifts",
    "input": "{\"grid\":[[1,2,3,4,5,6],[7,8,9,10,11,12],[13,14,15,16,17,18],[19,20,21,22,23,24]],\"k\":7}"
  },
  {
    "label": "A full outer revolution leaves one ring unchanged",
    "input": "{\"grid\":[[2,4,6,8],[10,12,14,16]],\"k\":8}"
  },
  {
    "label": "Smallest ring",
    "input": "{\"grid\":[[3,7],[11,15]],\"k\":1}"
  },
  {
    "label": "Very large k reduces by ring length",
    "input": "{\"grid\":[[4,9,2,7],[6,1,8,3],[5,12,10,11],[14,13,16,15]],\"k\":1000000000}"
  }
];
