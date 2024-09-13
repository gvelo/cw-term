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
import { Tx, TxCharEvent } from "./tx";
import { theme } from "./theme";
const enum TxStatus {
  transmitting = "transmitting",
  idle = "idle",
}

export class StatusBar {
  private terminal: Terminal;
  private tx: Tx;
  private cmd: string;
  private msgLenght: number;
  private txCharIdx: number;
  private txStatus: TxStatus;

  constructor(terminal: Terminal, tx: Tx) {
    this.terminal = terminal;
    this.tx = tx;
    this.tx.addCharEventListener(this.onTxChar);
    this.tx.addStartEventListener(this.onTxStart);
    this.tx.addStopEventListener(this.onTxStop);
    this.tx.addConfEventListener(this.onTxConfChange);
    this.terminal.addResizeEventListener(this.onResize);
    this.terminal.addClearEventListener(this.onClear);
    this.setViewPort();
    this.cmd = "";
    this.msgLenght = 0;
    this.txCharIdx = 0;
    this.txStatus = TxStatus.idle;
    this.render();
    this.setViewPort();
  }

  setCmd(cmd: string): void {
    this.cmd = cmd;
    this.render();
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

  private onTxChar = (event: TxCharEvent) => {
    this.txCharIdx = event.idx;
    this.msgLenght = event.message.length;
    this.render();
  };

  private onTxStart = () => {
    this.txStatus = TxStatus.transmitting;
    this.txCharIdx = 0;
    this.msgLenght = 0;
    this.render();
  };
  private onTxStop = () => {
    this.txStatus = TxStatus.idle;
    this.txCharIdx = 0;
    this.msgLenght = 0;
    this.render();
  };

  private onTxConfChange = () => {
    this.render();
  };

  private setViewPort(): void {
    const lastLine = this.terminal.rows - 1;
    this.terminal.write(`\u001B[0;${lastLine}r`);
  }

  private render = (): void => {
    this.saveCursor();
    this.cursorTo(this.terminal.rows, 0);
    const status = this.generateStatusBar();
    this.terminal.write(status);
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

  public generateStatusBar(): string {
    const bar = this.buildStatusStr(0);
    const padding = this.terminal.cols - bar.length;
    if (padding < 0) {
      return "";
    } else {
      return theme.statusBar(this.buildStatusStr(padding));
    }
  }

  public buildStatusStr(padding: number): string {
    const paddedCmd = this.cmd.padEnd(10);
    const paddedStatus = String(this.txStatus).padEnd(15);
    const progressBar = this.generateProgressBar();
    const txCharIdx = String(this.txCharIdx).padStart(3);
    const msgLength = String(this.msgLenght).padEnd(3);
    const pad = " ".repeat(padding);
    const statusBar = `cw-terminal | command:${paddedCmd}  status:${paddedStatus} ${progressBar} ${txCharIdx}/${msgLength} ${pad}wpm:${this.tx.wpm}  eff:${this.tx.eff}  tone:${this.tx.freq}Hz  volume:${this.tx.volume}`;
    return statusBar;
  }

  private generateProgressBar(): string {
    const barLength = 20; // Total length of the progress bar
    let filledLength = 0;

    if (this.msgLenght) {
      filledLength = Math.round((this.txCharIdx / this.msgLenght) * barLength);
    }

    const emptyLength = barLength - filledLength;
    return `[${"=".repeat(filledLength)}${" ".repeat(emptyLength)}]`;
  }
}
