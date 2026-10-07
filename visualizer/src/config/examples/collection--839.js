// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Direct swaps build chains between several anagram strings",
    "input": "{\"strs\":[\"abcde\",\"bacde\",\"baced\",\"edcba\",\"decba\"]}"
  },
  {
    "label": "Repeated identical strings form one group",
    "input": "{\"strs\":[\"noon\",\"noon\",\"noon\"]}"
  },
  {
    "label": "Two anagrams requiring more than one swap stay separate",
    "input": "{\"strs\":[\"abcd\",\"badc\"]}"
  },
  {
    "label": "One string starts and ends in one group",
    "input": "{\"strs\":[\"orbit\"]}"
  }
];
