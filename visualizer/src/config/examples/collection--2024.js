// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several minority clusters compete for the flip budget",
    "input": "{\"answerKey\":\"TTFFTFTTTFFTTFTF\",\"k\":3}"
  },
  {
    "label": "Already uniform input needs no flips",
    "input": "{\"answerKey\":\"FFFFF\",\"k\":2}"
  },
  {
    "label": "The budget can cover the entire input",
    "input": "{\"answerKey\":\"TFTFFTFTTF\",\"k\":10}"
  },
  {
    "label": "Alternating answers with a small budget",
    "input": "{\"answerKey\":\"TFTFTFTFTF\",\"k\":1}"
  }
];
