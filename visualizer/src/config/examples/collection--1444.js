// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Horizontal and vertical cuts leave different apple-rich remainders",
    "input": "{\"pizza\":[\"A..A\",\".AA.\",\"A...\",\"..AA\"],\"k\":3}"
  },
  {
    "label": "One piece requires at least one apple",
    "input": "{\"pizza\":[\"...\",\".A.\"],\"k\":1}"
  },
  {
    "label": "Too few apples makes the requested pieces impossible",
    "input": "{\"pizza\":[\"A..\",\"...\"],\"k\":3}"
  },
  {
    "label": "A single row permits only vertical cuts",
    "input": "{\"pizza\":[\"A.A.AA\"],\"k\":3}"
  }
];
