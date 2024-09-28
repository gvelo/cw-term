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

import { ConfStorage } from "../config";
import { Terminal } from "../Terminal";
import { Tx, TxCharEvent } from "../tx";
import {
  buildGroups,
  getLessonChars,
  checkGroups,
  PracticeResult,
} from "./groups";
import { theme } from "../theme";

export interface PlaybackParams {
  wpm?: number;
  eff?: number;
  volume?: number;
  freq?: number;
}

const CONF_STORAGE_KEY = "koch";

type LessonStatus = "pending" | "passed";

interface Config {
  lessonStatus: LessonStatus[];
  currentLesson: number;
  groupCount: number;
  charToImprove: string | null;
}

export class Koch {
  terminal: Terminal;
  tx: Tx;
  storage: ConfStorage;
  conf: Config;

  constructor(terminal: Terminal, tx: Tx, storage: ConfStorage) {
    this.terminal = terminal;
    this.tx = tx;
    this.storage = storage;

    const conf = storage.get(CONF_STORAGE_KEY);
    if (conf) {
      this.conf = conf;
    } else {
      this.conf = {
        lessonStatus: Array(40).fill("pending"),
        currentLesson: 1,
        groupCount: 12,
        charToImprove: null,
      };
      storage.set(CONF_STORAGE_KEY, conf);
    }
  }

  public showLesson(lessonNum: number): void {
    if (lessonNum < 0 || lessonNum > 40) {
      throw new Error(`invalid lesson number: ${lessonNum}`);
    }

    // Fallback to current lesson if lessonNum is 0
    if (lessonNum === 0) {
      lessonNum = this.conf.currentLesson;
    }

    // Get lesson characters and status
    const chars = getLessonChars(lessonNum);
    const status = this.conf.lessonStatus[lessonNum - 1];

    // Ensure status exists and map to the appropriate string
    const statusStr =
      status === "passed" ? theme.passed(status) : theme.pending(status);

    // Check if the lesson is the current one
    const isCurrent =
      lessonNum === this.conf.currentLesson ? "( current )" : "";

    // Build and write lesson information to the terminal
    const lessonInfo = `
      ${theme.info("Lesson:")} ${lessonNum} ${isCurrent} -- ${statusStr}
      ${theme.info("Main char:")} ${chars.mainChar}
      ${theme.info("Secondary chars:")} ${chars.secondaryChars.join(" ")}
    `;
    this.terminal.writeln(lessonInfo);
  }

  public listLessons(): void {
    for (let i = 1; i < 40; i++) {
      const { mainChar } = getLessonChars(i);
      const isCurrent = i === this.conf.currentLesson ? " <-- ( current )" : "";
      const status = this.conf.lessonStatus[i - 1];

      const statusStr = theme[status](status.padStart(14));

      this.terminal.write(
        `${String(i).padStart(3)} ${mainChar.padStart(
          3
        )} ${statusStr}${isCurrent}`
      );
      this.terminal.writeln();
    }
  }

  public setLesson(lessonNum: number): void {
    if (lessonNum < 0 || lessonNum > 40) {
      throw new Error(`invalid lesson number: ${lessonNum}`);
    }

    this.conf.currentLesson = lessonNum;

    this.terminal.writeln();
    this.terminal.writeln(theme.info(`lesson set to : ${lessonNum}`));
    this.showLesson(lessonNum);
  }

  public async listen(params: PlaybackParams) {
    return new Promise<void>((resolve) => {
      let chars: string[] = [];
      const lessonChars = getLessonChars(this.conf.currentLesson);

      if (this.conf.currentLesson === 1) {
        chars = [lessonChars.mainChar, ...lessonChars.secondaryChars];
      } else {
        chars = [lessonChars.mainChar];
      }

      let exit = false;
      let i = 0;

      this.terminal.writeln();
      this.terminal.write(
        theme.info(
          `lesson:${this.conf.currentLesson} chars: ${chars.join(" ")}`
        )
      );
      this.terminal.writeln("    press any key to stop...");
      this.terminal.writeln();

      const onTxStop = () => {
        this.terminal.writeln();
        if (exit) {
          this.tx.removeStopEventListener(onTxStop);
          this.tx.removeCharEventListener(onTxChar);
          this.terminal.writeln();
          resolve();
          return;
        }
        i++;
        txChar(chars[i % chars.length]);
      };

      const onTxChar = (event: TxCharEvent) => {
        this.terminal.write(theme.info(event.message[event.idx]));
      };

      const txChar = (char: string) => {
        this.tx.send(
          char.repeat(10) + " ",
          params.wpm,
          params.eff,
          params.freq,
          params.volume
        );
      };

      const onKeyPressed = (event: KeyboardEvent): boolean => {
        if (event.type == "keydown") {
          this.terminal.removeKeyboardHanlder();
          event.stopPropagation();
          event.preventDefault();
          exit = true;
          this.tx.stop();
          return false;
        } else {
          return true;
        }
      };

      this.terminal.addKeyboardHandler(onKeyPressed);

      this.tx.addStopEventListener(onTxStop);
      this.tx.addCharEventListener(onTxChar);
      txChar(chars[0]);
    });
  }

  public async practice(params: PlaybackParams) {
    const lessonChars = getLessonChars(
      this.conf.currentLesson,
      this.conf.charToImprove ?? undefined
    );

    const result = await this.practiceGroups(
      lessonChars.mainChar,
      lessonChars.secondaryChars,
      this.conf.groupCount,
      params
    );

    this.terminal.writeln();
    this.terminal.writeln(theme.info(`lesson: ${this.conf.currentLesson}`));

    this.printResult(result);

    this.terminal.writeln();

    const charPassed = result.charsStats.filter(
      (stat) => stat.accuracy >= 80
    ).length;

    if (charPassed == result.charsStats.length) {
      this.terminal.writeln(
        `Congratulations, all characters are above 80%. You passed the lesson.`
      );
      this.conf.lessonStatus[this.conf.currentLesson - 1] = "passed";
      this.conf.charToImprove = null;
    } else {
      this.terminal.writeln(
        `There are characters below 80%. You need to keep practicing.`
      );
      this.conf.charToImprove = result.charsStats[0].char;
    }
    this.saveConf();
    this.terminal.writeln();
  }

  public async practiceCustomChars(
    mainChar: string,
    secondaryChars: string[],
    params: PlaybackParams,
    groupCount?: number
  ) {
    const result = await this.practiceGroups(
      mainChar,
      secondaryChars,
      groupCount ?? this.conf.groupCount,
      params
    );

    this.terminal.writeln();
    this.terminal.writeln(theme.info(`custom groups:`));

    this.printResult(result);

    this.terminal.writeln();
  }

  public async practiceGroups(
    mainChar: string,
    secondaryChars: string[],
    groupCount: number,
    params: PlaybackParams
  ): Promise<PracticeResult> {
    const groups = buildGroups(mainChar, secondaryChars, groupCount);

    const message = groups.join(" ");

    this.tx.send(message, params.wpm, params.eff, params.freq, params.volume);

    const line = await this.terminal.readLine("rx> ");

    this.tx.stop();

    const recvGroups = line
      .toUpperCase()
      .split(" ")
      .filter((c) => c != " ");

    return checkGroups(groups, recvGroups);
  }

  private printResult(result: PracticeResult): void {
    this.terminal.writeln();
    this.terminal.writeln(theme.info("send\t\treceived"));

    for (let i = 0; i < result.send.length; i++) {
      this.printGroupWithError(result.send[i], result.errorsPos[i]);
      this.terminal.write("\t\t  ");
      this.printGroupWithError(result.recv[i], result.errorsPos[i]);
      this.terminal.writeln();
    }

    this.terminal.writeln();
    this.terminal.writeln("stats:");
    this.terminal.writeln();

    this.terminal.writeln("char    error/total   accuracy");
    result.charsStats.forEach((stat) => {
      this.terminal.writeln(
        ` ${stat.char}       ${stat.errors.toString().padStart(3)}/${stat.total
          .toString()
          .padEnd(3)}      ${stat.accuracy.toFixed(2).padStart(6)}%`
      );
    });
  }

  private printGroupWithError(group: string, errors: number[]): void {
    let posIndex = 0;
    for (let i = 0; i < group.length; i++) {
      const char = group[i];
      if (posIndex < errors.length && i === errors[posIndex]) {
        this.terminal.write(theme.errorChar(char));
        posIndex++;
      } else {
        this.terminal.write(char);
      }
    }
  }

  public showConfig(): void {}
  public setCofig(key: string, value: string): void {}
  private saveConf() {
    this.storage.set(CONF_STORAGE_KEY, this.conf);
  }
}
