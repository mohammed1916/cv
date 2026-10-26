// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several statements constrain an interdependent good group",
    "input": "{\"statements\":[[2,1,2,0,2],[1,2,1,2,2],[2,1,2,0,2],[0,2,0,2,1],[2,2,2,1,2]]}"
  },
  {
    "label": "Unknown statements allow everyone to be good",
    "input": "{\"statements\":[[2,2,2],[2,2,2],[2,2,2]]}"
  },
  {
    "label": "Two people accusing each other allow at most one good person",
    "input": "{\"statements\":[[2,0],[0,2]]}"
  },
  {
    "label": "One person with no statement can be good",
    "input": "{\"statements\":[[2]]}"
  }
];
