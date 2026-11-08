// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A seven-character word can repeat as a full subsequence",
    "input": "{\"s\":\"orchardorchard\",\"k\":2}"
  },
  {
    "label": "No letter appears often enough",
    "input": "{\"s\":\"abcdef\",\"k\":2}"
  },
  {
    "label": "Tied one-letter answers choose the largest letter",
    "input": "{\"s\":\"xyzzyx\",\"k\":2}"
  },
  {
    "label": "Repeated equal characters form a longer answer",
    "input": "{\"s\":\"aaaaaaaaaaaa\",\"k\":3}"
  },
  {
    "label": "Two letters with k two",
    "input": "{\"s\":\"ab\",\"k\":2}"
  },
  {
    "label": "Repeated letter",
    "input": "{\"s\":\"xxxxxx\",\"k\":2}"
  },
  {
    "label": "Twenty-four letters",
    "input": "{\"s\":\"abcdefghijklmnopqrstuvwx\",\"k\":6}"
  },
  {
    "label": "Long run: 24 letters",
    "input": "{\"s\":\"seypenbzudcgadlrdifregfi\",\"k\":4}"
  }
];
