// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "IPv6 mixed groups",
    "queryIP": "2a01:0db8:0000:0042:0000:8a2e:0370:7abc",
    "ip": "2a01:0db8:0000:0042:0000:8a2e:0370:7abc"
  },
  {
    "label": "IPv4",
    "queryIP": "172.19.204.8",
    "ip": "172.19.204.8"
  },
  {
    "label": "IPv4 leading zero",
    "queryIP": "172.019.204.8",
    "ip": "172.019.204.8"
  },
  {
    "label": "IPv4 overflow",
    "queryIP": "172.19.256.8",
    "ip": "172.19.256.8"
  },
  {
    "label": "Too few IPv6 groups",
    "queryIP": "2a01:db8:0:42:0:7abc",
    "ip": "2a01:db8:0:42:0:7abc"
  },
  {
    "label": "Non-hex IPv6",
    "queryIP": "2a01:db8:0:42:0:8a2e:370:7abg",
    "ip": "2a01:db8:0:42:0:8a2e:370:7abg"
  }
];
