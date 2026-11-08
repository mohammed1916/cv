// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Uneven row rewards change the best turn column",
    "input": "{\"grid\":[[7,2,11,4,9,3,8],[5,12,1,10,2,14,6]]}"
  },
  {
    "label": "One column leaves no unvisited points",
    "input": "{\"grid\":[[8],[13]]}"
  },
  {
    "label": "Large top suffix favors a later turn",
    "input": "{\"grid\":[[1,1,1,30],[2,2,2,2]]}"
  },
  {
    "label": "Equal rows create symmetric choices",
    "input": "{\"grid\":[[6,6,6,6],[6,6,6,6]]}"
  },
  {
    "label": "Two columns of zeros",
    "input": "[[0,0],[0,0]]"
  },
  {
    "label": "Equal values in three columns",
    "input": "[[5,5,5],[5,5,5]]"
  },
  {
    "label": "Alternating maximum and zero",
    "input": "[[100,0,100,0,100,0,100,0,100,0,100,0],[0,100,0,100,0,100,0,100,0,100,0,100]]"
  },
  {
    "label": "Long run: 12 columns",
    "input": "[[45,20,59,94,57,17,73,75,58,62,77,68],[48,64,1,99,26,77,51,17,54,97,57,50]]"
  }
];
