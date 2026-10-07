// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Longest repeated block begins inside the sequence",
    "input": "{\"sequence\":\"zzcabccabccabcyycabc\",\"word\":\"cabc\"}"
  },
  {
    "label": "Word absent",
    "input": "{\"sequence\":\"forestgrove\",\"word\":\"pine\"}"
  },
  {
    "label": "Repeated word overlaps itself",
    "input": "{\"sequence\":\"aaaaaaaaa\",\"word\":\"aa\"}"
  },
  {
    "label": "Word longer than sequence",
    "input": "{\"sequence\":\"oak\",\"word\":\"oakwood\"}"
  }
];
