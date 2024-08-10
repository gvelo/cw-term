import { buildGroups, MIN_CHAR_REPETITIONS } from "./groups";

describe('test groups', () => {
    test('test distributions on evenly sized groups of 2 characters', () => {
        const groups = buildGroups(1, 'K', 10, 4);
        const charCount = countCharRepetitions(groups);
        expect(charCount).toEqual({ 'K': 25, 'M': 25 });
        expect(1).toBe(1);
    });

    test('test distributions on odd groups  of 2 chars', () => {
        const groups = buildGroups(1, 'K', 11, 4);
        const charCount = countCharRepetitions(groups);
        expect(charCount).toEqual({ 'K': 28, 'M': 27 });
        expect(1).toBe(1);
    });

    test('test min repetition', () => {
        const groups = buildGroups(11, 'L', 12, 400);
        const charCount = countCharRepetitions(groups);
        for (const repetitions of Object.values(charCount)) {
            expect(repetitions).toBeGreaterThanOrEqual(MIN_CHAR_REPETITIONS);
        }
    });
});


function countCharRepetitions(groups: Array<string>): { [char: string]: number } {
    const chars = groups.join('');

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