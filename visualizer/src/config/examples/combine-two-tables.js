// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Matched missing and multiple addresses",
    "person": [
      {
        "personId": 11,
        "firstName": "Mira",
        "lastName": "Vale"
      },
      {
        "personId": 12,
        "firstName": "Oren",
        "lastName": "Pine"
      },
      {
        "personId": 13,
        "firstName": "Tara",
        "lastName": "Reed"
      },
      {
        "personId": 14,
        "firstName": "Ivo",
        "lastName": "Lake"
      }
    ],
    "address": [
      {
        "addressId": 21,
        "personId": 11,
        "city": "York",
        "state": "North"
      },
      {
        "addressId": 22,
        "personId": 11,
        "city": "Bath",
        "state": "West"
      },
      {
        "addressId": 23,
        "personId": 13,
        "city": "Leeds",
        "state": "North"
      }
    ]
  },
  {
    "label": "No addresses",
    "person": [
      {
        "personId": 31,
        "firstName": "Nila",
        "lastName": "Stone"
      }
    ],
    "address": []
  },
  {
    "label": "No people",
    "person": [],
    "address": []
  }
];
