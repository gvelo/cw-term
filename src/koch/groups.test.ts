import { buildGroups, getLessonChars, MIN_CHAR_REPETITIONS } from "./groups";

describe("test groups", () => {
  test("test distributions on evenly sized groups of 2 characters", () => {
    const groups = buildGroups("K", ["M"], 4);
    const charCount = countCharRepetitions(groups);
    expect(charCount).toEqual({ K: 10, M: 10 });
    expect(1).toBe(1);
  });

  test("test distributions on odd groups  of 2 chars", () => {
    const groups = buildGroups("K", ["M"], 5);
    const charCount = countCharRepetitions(groups);
    expect(charCount).toEqual({ K: 13, M: 12 });
    expect(1).toBe(1);
  });

  test("test min repetition", () => {
    const groups = buildGroups("A", ["B", "C", "D", "E"], 2);
    const charCount = countCharRepetitions(groups);
    console.log(charCount);
    expect(Object.keys(charCount).length).toEqual(2);
    for (const repetitions of Object.values(charCount)) {
      expect(repetitions).toBeGreaterThanOrEqual(MIN_CHAR_REPETITIONS);
    }
  });

  test("test lesson chars", () => {
    for (let i = 1; i < 41; i++) {
      console.log(getLessonChars(i));
    }
  });
});

function countCharRepetitions(groups: Array<string>): {
  [char: string]: number;
} {
  const chars = groups.join("");

  const charCount: { [char: string]: number } = {};

  for (const char of chars) {
    if (charCount[char]) {
      charCount[char]++;
    } else {
      charCount[char] = 1;
    }
  }

  return charCount;
}
