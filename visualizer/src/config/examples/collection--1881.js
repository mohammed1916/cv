// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Insert before the first improvable positive digit",
    "input": "{\"n\":\"77834529\",\"x\":6}"
  },
  {
    "label": "Negative number prefers a smaller early digit",
    "input": "{\"n\":\"-883762\",\"x\":4}"
  },
  {
    "label": "Append when no earlier position improves",
    "input": "{\"n\":\"99987\",\"x\":2}"
  },
  {
    "label": "Equal digits defer the insertion",
    "input": "{\"n\":\"5553\",\"x\":5}"
  }
];
