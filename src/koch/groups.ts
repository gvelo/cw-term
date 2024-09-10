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

class GroupCharSet extends Array<string> {
  addCharacter(character: string, repetitions: number): void {
    for (let i = 0; i < repetitions; i++) {
      this.push(character);
    }
  }
}

export class Groups extends Array<string> {
  constructor(
    lessonLevel: number,
    mainCharacter: string,
    groupCount: number,
    maxSecondaryCharacters: number
  ) {
    super();

    let availableSecondaryCharacters = MORSE_SYMBOLS.slice(
      0,
      lessonLevel + 1
    ).filter((char) => char !== mainCharacter);

    const totalCharCountInLesson = groupCount * GROUP_LEN;
    const secondaryCharCount = Math.floor(totalCharCountInLesson / 2);
    const mainCharacteCount = totalCharCountInLesson - secondaryCharCount;

    const lessonCharacters = new GroupCharSet();

    lessonCharacters.addCharacter(mainCharacter, mainCharacteCount);

    let secondaryCharsToAddCount =
      availableSecondaryCharacters.length > maxSecondaryCharacters
        ? maxSecondaryCharacters
        : availableSecondaryCharacters.length;

    let secondaryRepetitions = Math.floor(
      secondaryCharCount / secondaryCharsToAddCount
    );
    
    let secondaryRemainder = secondaryCharCount % secondaryCharsToAddCount;

    if (secondaryRepetitions < MIN_CHAR_REPETITIONS) {
      secondaryCharsToAddCount = secondaryCharCount / MIN_CHAR_REPETITIONS;
      secondaryRepetitions = MIN_CHAR_REPETITIONS;
      secondaryRemainder = secondaryCharsToAddCount % MIN_CHAR_REPETITIONS;
    }

    if (availableSecondaryCharacters.length > secondaryCharsToAddCount) {
      availableSecondaryCharacters = shuffleArray(
        availableSecondaryCharacters
      ).slice(0, secondaryCharsToAddCount);
    }

    const secondayDistribution = buildSecDistribution(
      availableSecondaryCharacters,
      secondaryRepetitions,
      secondaryRemainder
    );

    for (const dist of secondayDistribution) {
      lessonCharacters.addCharacter(dist.char, dist.repetitions);
    }

    const shuffledChars = shuffleArray(lessonCharacters);

    for (let i = 0; i < shuffledChars.length; i += GROUP_LEN) {
      this.push(shuffledChars.slice(i, i + GROUP_LEN).join(""));
    }
  }
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

export function buildGroups(
  lesson: number,
  mainChar: string,
  numOfGroups: number,
  maxSecCharacters: number
): Groups {
  return new Groups(lesson, mainChar, numOfGroups, maxSecCharacters);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffledArray = array.slice();
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}
