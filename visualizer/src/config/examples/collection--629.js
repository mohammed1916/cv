// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several insertion windows contribute to one inversion target",
    "input": "{\"n\":8,\"k\":12}"
  },
  {
    "label": "Zero inversions has only increasing order",
    "input": "{\"n\":9,\"k\":0}"
  },
  {
    "label": "The maximum inversion count has only decreasing order",
    "input": "{\"n\":6,\"k\":15}"
  },
  {
    "label": "An unattainable inversion count returns zero",
    "input": "{\"n\":4,\"k\":8}"
  },
  {
    "label": "Single element with zero inversions",
    "input": "{\"n\":1,\"k\":0}"
  },
  {
    "label": "Two elements with no attainable count",
    "input": "{\"n\":2,\"k\":2}"
  },
  {
    "label": "Largest inversion count for twelve",
    "input": "{\"n\":12,\"k\":60}"
  },
  {
    "label": "Long run: eleven elements with a middle count",
    "input": "{\"n\":11,\"k\":27}"
  }
];
