// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Keys move between count buckets while empty buckets disappear",
    "input": "{\"operations\":[[\"inc\",\"fern\"],[\"inc\",\"oak\"],[\"inc\",\"fern\"],[\"inc\",\"pine\"],[\"inc\",\"pine\"],[\"inc\",\"pine\"],[\"getMaxKey\"],[\"dec\",\"pine\"],[\"dec\",\"fern\"],[\"getMinKey\"],[\"dec\",\"oak\"],[\"getMaxKey\"]]}"
  },
  {
    "label": "Empty extreme queries return empty strings",
    "input": "{\"operations\":[[\"getMinKey\"],[\"getMaxKey\"],[\"inc\",\"bay\"],[\"dec\",\"bay\"],[\"getMinKey\"]]}"
  },
  {
    "label": "Several keys can share one count bucket",
    "input": "{\"operations\":[[\"inc\",\"a\"],[\"inc\",\"b\"],[\"inc\",\"c\"],[\"getMinKey\"],[\"getMaxKey\"],[\"inc\",\"b\"],[\"getMaxKey\"]]}"
  },
  {
    "label": "Decrementing can recreate a missing intermediate bucket",
    "input": "{\"operations\":[[\"inc\",\"x\"],[\"inc\",\"x\"],[\"inc\",\"x\"],[\"inc\",\"y\"],[\"dec\",\"x\"],[\"getMinKey\"],[\"getMaxKey\"]]}"
  }
];
