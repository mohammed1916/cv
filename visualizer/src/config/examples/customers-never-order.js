// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Some customers order repeatedly",
    "customers": [
      {
        "id": 11,
        "name": "Mira"
      },
      {
        "id": 12,
        "name": "Oren"
      },
      {
        "id": 13,
        "name": "Tara"
      },
      {
        "id": 14,
        "name": "Ivo"
      }
    ],
    "orders": [
      {
        "id": 21,
        "customerId": 11
      },
      {
        "id": 22,
        "customerId": 11
      },
      {
        "id": 23,
        "customerId": 13
      }
    ]
  },
  {
    "label": "Nobody orders",
    "customers": [
      {
        "id": 31,
        "name": "Nila"
      },
      {
        "id": 32,
        "name": "Soren"
      }
    ],
    "orders": []
  },
  {
    "label": "Everyone orders",
    "customers": [
      {
        "id": 41,
        "name": "Eli"
      }
    ],
    "orders": [
      {
        "id": 51,
        "customerId": 41
      }
    ]
  }
];
