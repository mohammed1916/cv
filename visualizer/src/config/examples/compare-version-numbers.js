// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Late differing revision",
    "version1": "12.004.7.0.13",
    "version2": "12.4.7.0.9"
  },
  {
    "label": "Trailing zero equality",
    "version1": "3.07.0.0",
    "version2": "3.7"
  },
  {
    "label": "Leading zero equality",
    "version1": "0008.0002",
    "version2": "8.2"
  },
  {
    "label": "Shorter is smaller",
    "version1": "4.9",
    "version2": "4.9.1"
  },
  {
    "label": "First revision decides",
    "version1": "11.0",
    "version2": "9.99"
  },
  {
    "label": "Equal after leading zeros",
    "version1": "001",
    "version2": "1"
  },
  {
    "label": "Zero revisions compare equal",
    "version1": "1.0.0.0",
    "version2": "1"
  },
  {
    "label": "Longest allowed versions differ at the end",
    "version1": "1.2.3.4.5.6.7.8.9.10.11.12.13.14.15.16.17.18.19",
    "version2": "1.2.3.4.5.6.7.8.9.10.11.12.13.14.15.16.17.18.20"
  },
  {
    "label": "Long run: 12 revisions",
    "version1": "83.85.77.91.94.23.47.47.2.3.21.2",
    "version2": "83.85.77.91.94.23.47.47.2.4.21.2"
  }
];
