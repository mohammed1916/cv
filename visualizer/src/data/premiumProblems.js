/**
 * LeetCode Premium (subscriber-only) problem numbers.
 *
 * Their descriptions are not in public/data/problemDescriptions.json and never
 * will be — the scraper can only reach public problems. ProblemInfoPanel uses
 * this to show an explicit "Premium problem" note instead of a vague
 * "Description not available", which otherwise reads like a bug.
 *
 * The visualizers for these problems still work; only the description text is
 * unavailable.
 */
export const PREMIUM_PROBLEM_NUMBERS = new Set([
  156, 157, 158, 159, 161, 163, 170, 186,
  243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 259,
  261, 265, 266, 267, 269, 270, 271, 272, 276, 277, 280, 281, 285, 286, 288,
  291, 293, 294, 296, 298,
  305, 308, 311, 314, 317, 320, 323, 325, 333, 339, 340, 346, 348, 351, 353,
  356, 358, 359, 360, 361, 362, 364, 366, 369, 370, 379,
  411, 418, 422, 426, 428, 431, 432, 439, 444, 469, 479, 481, 484, 487, 489,
  490, 499,
  505, 506, 510, 516, 520, 527, 531, 533, 536, 544, 545, 548, 549, 555, 558,
  562, 568, 570, 571, 573, 574, 577, 578, 579, 580, 581, 582, 583, 584, 588,
  596, 597, 598,
  600, 601, 602, 603, 604, 605, 606, 607, 608, 609, 610, 612, 613, 614, 615,
  618, 619, 620, 626, 627,
])

/** True when this problem's description is unavailable because it's Premium. */
export function isPremiumProblem(number) {
  return PREMIUM_PROBLEM_NUMBERS.has(Number(number))
}
