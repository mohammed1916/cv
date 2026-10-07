// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Multiple insertions preserve original indices in a long string",
    "input": "{\"s\":\"Brightlanternsguidequietboats\",\"spaces\":[6,14,19,24]}"
  },
  {
    "label": "An insertion at zero produces a leading space",
    "input": "{\"s\":\"harbor\",\"spaces\":[0]}"
  },
  {
    "label": "Adjacent insertion indices each precede one character",
    "input": "{\"s\":\"abcdef\",\"spaces\":[1,2,3,5]}"
  },
  {
    "label": "An empty insertion list leaves the text unchanged",
    "input": "{\"s\":\"unbroken\",\"spaces\":[]}"
  }
];
