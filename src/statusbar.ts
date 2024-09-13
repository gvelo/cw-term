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

import { ResizeEvent, Terminal } from "./Terminal";
import { Tx } from "./tx";

export class StatusBar {
  private terminal: Terminal;
  private tx: Tx;
  private cmd: string;

  constructor(terminal: Terminal, tx: Tx) {
    this.terminal = terminal;
    this.tx = tx;
    this.terminal.addResizeEventListener(this.onResize);
    this.terminal.addClearEventListener(this.onClear);
    this.setViewPort();
    this.cmd = "";
    this.render();
    this.setViewPort();
  }

  setCmd(cmd: string): void {
    this.cmd = cmd;
  }

  private onResize = (event: ResizeEvent): void => {
    if (!event.fit) {
      this.saveCursor();
      this.cursorTo(this.terminal.rows, 0);
      this.eraseLine();
      this.restoreCursor();
    } else {
      this.saveCursor();
      this.setViewPort();
      this.restoreCursor();
      this.render();
    }
  };

  private onClear = (): void => {
    this.render();
  };

  private setViewPort(): void {
    const lastLine = this.terminal.rows - 1;
    this.terminal.write(`\u001B[0;${lastLine}r`);
  }

  private render = (): void => {
    this.saveCursor();
    this.cursorTo(this.terminal.rows, 0);
    this.terminal.write(`hello world`);
    this.restoreCursor();
  };

  private cursorTo(x: number, y: number): void {
    this.terminal.write(`\u001B[${x};${y}H`);
  }

  private saveCursor(): void {
    this.terminal.write("\u001B[s");
  }

  private restoreCursor(): void {
    this.terminal.write("\u001B[u");
  }

  private eraseLine(): void {
    this.terminal.write("\u001B[2K");
  }
}
