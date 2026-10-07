// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Queries fall before, between, and after occurrence groups",
    "input": "{\"colors\":[2,1,3,2,2,1,3,1,2,3,3,1],\"queries\":[[0,3],[4,1],[7,2],[11,3],[6,3]]}"
  },
  {
    "label": "Requested color absent",
    "input": "{\"colors\":[1,1,2,2],\"queries\":[[0,3],[3,3]]}"
  },
  {
    "label": "Query already matches",
    "input": "{\"colors\":[3,2,1],\"queries\":[[1,2]]}"
  },
  {
    "label": "Nearest occurrences tie",
    "input": "{\"colors\":[1,2,2,2,1],\"queries\":[[2,1]]}"
  }
];
