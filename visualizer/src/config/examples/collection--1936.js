// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Different gaps need different numbers of intermediate rungs",
    "input": "{\"rungs\":[3,8,17,21,35,42,58],\"dist\":5}"
  },
  {
    "label": "Exact multiples need no endpoint duplicates",
    "input": "{\"rungs\":[4,8,12,16],\"dist\":4}"
  },
  {
    "label": "First rung is far above ground",
    "input": "{\"rungs\":[29],\"dist\":6}"
  },
  {
    "label": "Every integer height is required",
    "input": "{\"rungs\":[2,5,9],\"dist\":1}"
  }
];
