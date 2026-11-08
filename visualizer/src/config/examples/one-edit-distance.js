// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "One insertion inside a longer word",
    "s1": "riverbank",
    "s2": "riverbanks"
  },
  {
    "label": "One replacement",
    "s1": "lantern",
    "s2": "lantorn"
  },
  {
    "label": "Equal is zero edits",
    "s1": "meadow",
    "s2": "meadow"
  },
  {
    "label": "Two mismatches",
    "s1": "cedar",
    "s2": "cider"
  },
  {
    "label": "Empty to one",
    "s1": "",
    "s2": "q"
  },
  {
    "label": "Both strings differ by one letter",
    "s1": "a",
    "s2": "b"
  },
  {
    "label": "Repeated letters with one deletion",
    "s1": "aaaa",
    "s2": "aaa"
  },
  {
    "label": "Longest allowed strings differ at the last letter",
    "s1": "abcdefghijklmnopqrstuvwxyzabcd",
    "s2": "abcdefghijklmnopqrstuvwxyzabce"
  },
  {
    "label": "Long run: insertion deep inside",
    "s1": "tgzgmihgvgpewoocvhzehcyrthio",
    "s2": "tgzgmihgvgpewqoocvhzehcyrthio"
  }
];
