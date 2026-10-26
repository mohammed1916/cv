// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "People budgets and capped profits combine across several jobs",
    "input": "{\"n\":9,\"minProfit\":8,\"group\":[2,3,1,4,2],\"profit\":[3,5,1,7,4]}"
  },
  {
    "label": "Zero target profit includes the empty scheme",
    "input": "{\"n\":4,\"minProfit\":0,\"group\":[1,2,3],\"profit\":[0,2,4]}"
  },
  {
    "label": "Jobs requiring too many people cannot be used",
    "input": "{\"n\":2,\"minProfit\":3,\"group\":[3,4],\"profit\":[8,10]}"
  },
  {
    "label": "Different jobs with equal attributes remain separate choices",
    "input": "{\"n\":4,\"minProfit\":4,\"group\":[2,2,2],\"profit\":[4,4,4]}"
  }
];
