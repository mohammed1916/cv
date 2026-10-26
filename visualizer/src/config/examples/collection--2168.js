// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated digit patterns create equal-frequency and duplicate text windows",
    "input": "{\"s\":\"121203031212\"}"
  },
  {
    "label": "One repeated digit makes every length valid but duplicate occurrences collapse",
    "input": "{\"s\":\"777777\"}"
  },
  {
    "label": "All distinct digits give equal frequency one in every substring",
    "input": "{\"s\":\"024681\"}"
  },
  {
    "label": "A single zero is a valid distinct substring",
    "input": "{\"s\":\"0\"}"
  }
];
