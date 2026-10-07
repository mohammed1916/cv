// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Add delete replace and duplicate connections form several groups",
    "input": "{\"words\":[\"ab\",\"abc\",\"ac\",\"bc\",\"cab\",\"xyz\",\"xy\",\"xw\",\"mnop\",\"mno\"]}"
  },
  {
    "label": "Singleton letters connect through replacement",
    "input": "{\"words\":[\"a\",\"d\",\"q\",\"z\"]}"
  },
  {
    "label": "Widely different letter sets remain separate",
    "input": "{\"words\":[\"abc\",\"mnop\",\"uvwxyz\"]}"
  },
  {
    "label": "Anagrams are duplicate letter-set members",
    "input": "{\"words\":[\"abcd\",\"dcba\",\"badc\",\"cdab\"]}"
  }
];
