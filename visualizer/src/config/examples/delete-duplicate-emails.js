// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several duplicate groups",
    "person": [
      {
        "id": 11,
        "email": "mira@example.org"
      },
      {
        "id": 12,
        "email": "oren@example.org"
      },
      {
        "id": 13,
        "email": "mira@example.org"
      },
      {
        "id": 14,
        "email": "tara@example.org"
      },
      {
        "id": 15,
        "email": "oren@example.org"
      },
      {
        "id": 16,
        "email": "mira@example.org"
      }
    ]
  },
  {
    "label": "All distinct",
    "person": [
      {
        "id": 11,
        "email": "mira@example.org"
      },
      {
        "id": 12,
        "email": "oren@example.org"
      }
    ]
  },
  {
    "label": "One record",
    "person": [
      {
        "id": 11,
        "email": "mira@example.org"
      }
    ]
  },
  {
    "label": "Empty table",
    "person": []
  }
];
