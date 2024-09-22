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
import { getLessonChars } from "./groups";
import { theme } from "../theme";

export interface PlaybackParams {
  wpm?: number;
  eff?: number;
  volume?: number;
  freq?: number;
}

const LESSON_COUNT = 41;
const CONF_STORAGE_KEY = "koch";

type LessonStatus = "pending" | "passed";

interface Config {
  lessonStatus: LessonStatus[];
  currentLesson: number;
  groupCount: number;
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

    let conf = storage.get(CONF_STORAGE_KEY);
    if (conf) {
      this.conf = conf;
    } else {
      this.conf = {
        lessonStatus: Array(40).fill("pending"),
        currentLesson: 1,
        groupCount: 12,
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
  public practice(params: PlaybackParams): void {}
  public practiceCustomChars(
    mainChar: string,
    secondaryChars: string[],
    params: PlaybackParams
  ): void {}
  public showConfig(): void {}
  public setCofig(key: string, value: string): void {}
}
