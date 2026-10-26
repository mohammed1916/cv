// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several one bits contribute smaller-prefix branches",
    "input": "{\"n\":674}"
  },
  {
    "label": "Consecutive leading ones end the equal-prefix scan early",
    "input": "{\"n\":203}"
  },
  {
    "label": "The smallest positive bound includes zero and one",
    "input": "{\"n\":1}"
  },
  {
    "label": "An alternating bound is itself valid and must be included",
    "input": "{\"n\":341}"
  }
];
