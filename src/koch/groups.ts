// Copyright 2024 The cw-console authors.
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

const MORSE_SYMBOLS: string[] = [
  "K",
  "M",
  "U",
  "R",
  "E",
  "S",
  "N",
  "A",
  "P",
  "T",
  "L",
  "W",
  "I",
  ".",
  "J",
  "Z",
  "=",
  "F",
  "O",
  "Y",
  ",",
  "V",
  "G",
  "5",
  "/",
  "Q",
  "9",
  "2",
  "H",
  "3",
  "8",
  "B",
  "?",
  "4",
  "7",
  "C",
  "1",
  "D",
  "6",
  "0",
  "X",
] as const;

export const GROUP_LEN: number = 5;
export const MIN_CHAR_REPETITIONS = 5;

class LessonChars extends Array<string> {
  addCharacter(character: string, repetitions: number): void {
    for (let i = 0; i < repetitions; i++) {
      this.push(character);
    }
  }
}

export function buildGroups(
  mainChar: string,
  secondaryChars: string[],
  groupCount: number
): string[] {
  const lessonCharCount = groupCount * GROUP_LEN;
  const secondaryLessonCharCount = Math.floor(lessonCharCount / 2);
  const mainLessonCharCount = lessonCharCount - secondaryLessonCharCount;

  const lessonChars = new LessonChars();
  lessonChars.addCharacter(mainChar, mainLessonCharCount);

  let secRepetitionCount = secondaryLessonCharCount / secondaryChars.length;
  let secRepetitionRemainder = secondaryLessonCharCount % secondaryChars.length;
  let secondaryCharsToAdd = [...secondaryChars];

  if (secRepetitionCount < MIN_CHAR_REPETITIONS) {
    secRepetitionCount = MIN_CHAR_REPETITIONS;
    const secCharCount = secondaryLessonCharCount / MIN_CHAR_REPETITIONS;
    secondaryCharsToAdd = shuffleArray(secondaryChars).slice(0, secCharCount);
    secRepetitionRemainder = secondaryLessonCharCount % secCharCount;
  }

  const secondayDistribution = buildSecDistribution(
    secondaryCharsToAdd,
    secRepetitionCount,
    secRepetitionRemainder
  );

  for (const dist of secondayDistribution) {
    lessonChars.addCharacter(dist.char, dist.repetitions);
  }

  const shuffledChars = shuffleArray(lessonChars);

  let groups: string[] = [];

  for (let i = 0; i < shuffledChars.length; i += GROUP_LEN) {
    groups.push(shuffledChars.slice(i, i + GROUP_LEN).join(""));
  }

  return groups;
}

function buildSecDistribution(
  secondayChars: Array<string>,
  repetitions: number,
  remainder: number
): Array<{ char: string; repetitions: number }> {
  const dist = new Array<{ char: string; repetitions: number }>();

  for (const char of secondayChars) {
    dist.push({ char: char, repetitions: repetitions });
  }

  for (let i = 0; i < remainder; i++) {
    dist[i].repetitions++;
  }

  return dist;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffledArray = array.slice();
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

export interface Lesson {
  mainChar: string;
  secondaryChars: string[];
}

export function getLessonChars(lessonNumber: number): Lesson {
  if (lessonNumber > 40) {
    throw new Error("invalid lesson number");
  }
  let lesson: Lesson = {
    mainChar: MORSE_SYMBOLS[lessonNumber],
    secondaryChars: MORSE_SYMBOLS.slice(0, lessonNumber),
  };
  return lesson;
}

export interface PracticeResult {
  send: string[];
  recv: string[];
  errorsPos: number[][];
  charsStats: {
    [key: string]: {
      total: number;
      errors: number;
      accuracy: number;
    };
  };
}

export function checkGroups(send: string[], recv: string[]): PracticeResult {
  const result: PracticeResult = {
    send: [],
    recv: [],
    errorsPos: [],
    charsStats: {},
  };

  for (let i = 0; i < send.length; i++) {
    const sentGroup = send[i];
    const recvGroup = (recv[i] ?? "").padEnd(GROUP_LEN);
    result.send.push(sentGroup);
    result.recv.push(recvGroup);
    const differingPositions: number[] = [];
    for (let c = 0; c < sentGroup.length; c++) {
      let stats = result.charsStats[sentGroup[c]] ?? {
        total: 0,
        errors: 0,
        accuracy: 0,
      };
      result.charsStats[sentGroup[c]] = stats;
      stats.total++;
      if (sentGroup[c] !== recvGroup[c]) {
        differingPositions.push(c);
        stats.errors++;
      }
      stats.accuracy = ((stats.total - stats.errors) * 100) / stats.total;
    }
    result.errorsPos.push(differingPositions);
  }
  return result;
}
