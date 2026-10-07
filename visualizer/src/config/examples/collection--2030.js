// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Lexicographic pops compete with a required-letter quota",
    "input": "{\"s\":\"cbadabecadba\",\"k\":7,\"letter\":\"a\",\"repetition\":3}"
  },
  {
    "label": "Every output slot is reserved for the required letter",
    "input": "{\"s\":\"zbazayaa\",\"k\":4,\"letter\":\"a\",\"repetition\":4}"
  },
  {
    "label": "Taking the whole string forbids every deletion",
    "input": "{\"s\":\"cababa\",\"k\":6,\"letter\":\"b\",\"repetition\":2}"
  },
  {
    "label": "A late required letter must keep an available slot",
    "input": "{\"s\":\"abcdefz\",\"k\":3,\"letter\":\"z\",\"repetition\":1}"
  }
];
