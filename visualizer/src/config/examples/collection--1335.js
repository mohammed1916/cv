// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Ordered high and low jobs create competing daily blocks",
    "input": "{\"jobDifficulty\":[8,2,6,10,3,7,4,9],\"d\":3}"
  },
  {
    "label": "More days than jobs is impossible",
    "input": "{\"jobDifficulty\":[4,7],\"d\":3}"
  },
  {
    "label": "One day pays only the maximum difficulty",
    "input": "{\"jobDifficulty\":[3,9,2,6],\"d\":1}"
  },
  {
    "label": "One job per day pays the sum",
    "input": "{\"jobDifficulty\":[5,2,8,4],\"d\":4}"
  }
];
