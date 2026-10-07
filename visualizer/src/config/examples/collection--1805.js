// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Leading zeros and repeated long integers normalize together",
    "input": "{\"word\":\"oak00042pine7fir42moss0007elm90000000000000000001ash90000000000000000001\"}"
  },
  {
    "label": "All-zero runs are one integer",
    "input": "{\"word\":\"a0b000c00000\"}"
  },
  {
    "label": "No digit runs",
    "input": "{\"word\":\"forestgrove\"}"
  },
  {
    "label": "Adjacent digits form one complete integer",
    "input": "{\"word\":\"12345678901234567890\"}"
  }
];
