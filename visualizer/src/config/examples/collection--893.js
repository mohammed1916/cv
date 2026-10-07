// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Words share parity-specific signatures",
    "input": "{\"words\":[\"abcd\",\"cbad\",\"adcb\",\"cdab\",\"abdc\",\"badc\"]}"
  },
  {
    "label": "One-letter groups",
    "input": "{\"words\":[\"a\",\"b\",\"a\",\"c\"]}"
  },
  {
    "label": "Repeated identical words",
    "input": "{\"words\":[\"moss\",\"moss\"]}"
  },
  {
    "label": "Same multiset different parity",
    "input": "{\"words\":[\"ab\",\"ba\"]}"
  }
];
