// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated prefix matches count separate word occurrences",
    "input": "{\"words\":[\"harbor\",\"hardwood\",\"harmony\",\"orchard\",\"hare\",\"harbor\",\"hill\",\"harvest\"],\"pref\":\"har\"}"
  },
  {
    "label": "The prefix can be longer than every word",
    "input": "{\"words\":[\"oak\",\"elm\",\"ash\"],\"pref\":\"forest\"}"
  },
  {
    "label": "An exact word match also starts with the prefix",
    "input": "{\"words\":[\"bay\",\"bayside\",\"bayou\",\"clay\"],\"pref\":\"bay\"}"
  },
  {
    "label": "An internal fragment does not count as a prefix",
    "input": "{\"words\":[\"replant\",\"upland\",\"island\"],\"pref\":\"land\"}"
  }
];
