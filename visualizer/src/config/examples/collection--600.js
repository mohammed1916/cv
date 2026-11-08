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
  },
  {
    "label": "Bound two includes one and two",
    "input": "{\"n\":2}"
  },
  {
    "label": "Largest allowed bound",
    "input": "{\"n\":1000000000}"
  },
  {
    "label": "All ones in binary",
    "input": "{\"n\":255}"
  },
  {
    "label": "Long run: a large mixed bound",
    "input": "{\"n\":536870911}"
  }
];
