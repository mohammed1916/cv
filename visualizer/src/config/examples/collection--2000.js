// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "The first repeated boundary character controls the reversal",
    "input": "{\"word\":\"lanternrivertrail\",\"ch\":\"r\"}"
  },
  {
    "label": "Boundary already at the first character",
    "input": "{\"word\":\"meadow\",\"ch\":\"m\"}"
  },
  {
    "label": "The requested character is absent",
    "input": "{\"word\":\"orchard\",\"ch\":\"z\"}"
  },
  {
    "label": "Boundary at the last character reverses the entire word",
    "input": "{\"word\":\"clouds\",\"ch\":\"s\"}"
  },
  {
    "label": "Single letter that matches",
    "input": "{\"word\":\"q\",\"ch\":\"q\"}"
  },
  {
    "label": "Letter not in the word",
    "input": "{\"word\":\"aaaa\",\"ch\":\"b\"}"
  },
  {
    "label": "Repeated letter at both ends",
    "input": "{\"word\":\"eabcdee\",\"ch\":\"e\"}"
  },
  {
    "label": "Long run: 100 letters",
    "input": "{\"word\":\"qnaxqxxngnlpppmaparyjxjaacmdvkzlqfcdcggeulobyqtgjkrkcbjrvkhijhtiegzxudacdtfjiyglwvtnzqpefeixgogzelfj\",\"ch\":\"r\"}"
  }
];
