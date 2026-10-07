// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Reassignment chains free partners for later invitations",
    "input": "{\"grid\":[[1,1,0,0,0],[1,0,0,0,0],[0,1,1,1,0],[0,0,1,0,1],[0,0,0,1,0]]}"
  },
  {
    "label": "No acceptable partners",
    "input": "{\"grid\":[[0,0],[0,0]]}"
  },
  {
    "label": "Several invitations compete for one partner",
    "input": "{\"grid\":[[1],[1],[1]]}"
  },
  {
    "label": "Every pair acceptable",
    "input": "{\"grid\":[[1,1,1],[1,1,1]]}"
  }
];
