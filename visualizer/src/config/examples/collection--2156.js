// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated matching windows must return the earliest source position",
    "input": "{\"s\":\"zzzcabcabxy\",\"power\":3,\"modulo\":101,\"k\":3,\"hashValue\":24}"
  },
  {
    "label": "A modulus of one makes every full window match",
    "input": "{\"s\":\"lanternriver\",\"power\":7,\"modulo\":1,\"k\":4,\"hashValue\":0}"
  },
  {
    "label": "The entire string is the only full window",
    "input": "{\"s\":\"fern\",\"power\":2,\"modulo\":101,\"k\":4,\"hashValue\":99}"
  },
  {
    "label": "A matching internal window follows two nonmatching windows",
    "input": "{\"s\":\"azbycx\",\"power\":5,\"modulo\":97,\"k\":2,\"hashValue\":30}"
  }
];
