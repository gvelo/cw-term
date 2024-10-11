// Copyright 2024 The cw-term authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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

  test("test lesson chars with main", () => {
    const lesson = getLessonChars(5, "R");
    expect(lesson.mainChar).toEqual("R");
    expect(lesson.secondaryChars).toEqual(["K", "M", "U", "E", "S"]);
  });

  test("test lesson chars with main error", () => {
    expect(() => getLessonChars(5, "X")).toThrow(
      new Error("main char not present in lesson")
    );
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
