// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Cap search balances over- and undershooting sums",
    "input": "{\"arr\":[17,4,28,9,22,6,31,12],\"target\":94}"
  },
  {
    "label": "Exact sum needs no reduction",
    "input": "{\"arr\":[3,8,11],\"target\":22}"
  },
  {
    "label": "Tie prefers smaller cap",
    "input": "{\"arr\":[5,5],\"target\":7}"
  },
  {
    "label": "Zero target chooses zero cap",
    "input": "{\"arr\":[4,9,13],\"target\":0}"
  }
];
