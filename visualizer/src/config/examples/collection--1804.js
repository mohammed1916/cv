// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Duplicates, shared prefixes, and erasure affect different counts",
    "input": "{\"operations\":[[\"insert\",\"forest\"],[\"insert\",\"fork\"],[\"insert\",\"forest\"],[\"insert\",\"for\"],[\"countWordsStartingWith\",\"for\"],[\"countWordsEqualTo\",\"for\"],[\"erase\",\"forest\"],[\"countWordsEqualTo\",\"forest\"],[\"countWordsStartingWith\",\"fore\"],[\"erase\",\"for\"],[\"countWordsEqualTo\",\"for\"],[\"countWordsStartingWith\",\"for\"]]}"
  },
  {
    "label": "Counts on an empty trie",
    "input": "{\"operations\":[[\"countWordsEqualTo\",\"oak\"],[\"countWordsStartingWith\",\"o\"]]}"
  },
  {
    "label": "Erasing a prefix preserves its longer word",
    "input": "{\"operations\":[[\"insert\",\"a\"],[\"insert\",\"ab\"],[\"erase\",\"a\"],[\"countWordsEqualTo\",\"a\"],[\"countWordsStartingWith\",\"a\"],[\"countWordsEqualTo\",\"ab\"]]}"
  },
  {
    "label": "Erase final occurrence then reuse its path",
    "input": "{\"operations\":[[\"insert\",\"elm\"],[\"erase\",\"elm\"],[\"countWordsStartingWith\",\"e\"],[\"insert\",\"elm\"],[\"countWordsEqualTo\",\"elm\"]]}"
  }
];
