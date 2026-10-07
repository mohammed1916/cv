// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A locally attractive pair can restrict later students",
    "input": "{\"students\":[[1,0,1,1],[0,1,0,1],[1,1,0,0],[0,0,1,0]],\"mentors\":[[1,1,1,0],[1,0,0,1],[0,1,1,1],[0,0,0,0]]}"
  },
  {
    "label": "All pairings have equal scores",
    "input": "{\"students\":[[1,1],[1,1]],\"mentors\":[[0,0],[0,0]]}"
  },
  {
    "label": "One student and one mentor",
    "input": "{\"students\":[[1,0,1]],\"mentors\":[[1,1,1]]}"
  },
  {
    "label": "Perfect matches appear in reverse order",
    "input": "{\"students\":[[1,0],[0,1],[1,1]],\"mentors\":[[1,1],[0,1],[1,0]]}"
  }
];
