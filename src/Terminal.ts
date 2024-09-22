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

import { Terminal as Xterm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { Readline } from "xterm-readline";
import { EventEmitter, EventListener } from "./emiter";

export type ResizeEvent = { fit: boolean };
export type ClearTTYEvent = "ClearTTYEvent";
export type KeyboardHandler = (e: KeyboardEvent) => boolean;
export class Terminal {
  private xterm: Xterm;
  private input: Readline;
  private fitAddon: FitAddon;
  private readonly resizeEmitter: EventEmitter<ResizeEvent>;
  private readonly clearTTYEmitter: EventEmitter<ClearTTYEvent>;
  private keyboardHandler: KeyboardHandler | null;
  constructor(termDiv: HTMLElement) {
    this.resizeEmitter = new EventEmitter<ResizeEvent>();
    this.clearTTYEmitter = new EventEmitter<ClearTTYEvent>();
    this.fitAddon = new FitAddon();
    this.input = new Readline();
    this.keyboardHandler = null;

    this.xterm = new Xterm({
      cursorBlink: true,
      convertEol: true,
      cursorStyle: "block",
      fontFamily: '"Cascadia Code", Menlo, monospace',
      theme: {
        foreground: "#FFFFFF",
        background: "#000000",
      },
    });

    this.xterm.loadAddon(this.fitAddon);
    this.xterm.loadAddon(this.input);

    this.xterm.open(termDiv!);

    this.fitAddon.fit();
    this.xterm.focus();

    this.xterm.attachCustomKeyEventHandler(this.onKeyboardEvent);

    window.addEventListener("resize", this.onResize);
    this.xterm.parser.registerCsiHandler({ final: "J" }, () => {
      setTimeout(() => {
        this.clearTTYEmitter.emit("ClearTTYEvent");
      });
      return false;
    });
  }

  write(obj: any) {
    this.xterm.write(String(obj));
  }

  writeln(obj?: any) {
    if (obj) {
      this.xterm.write(String(obj) + "\r\n");
    } else {
      this.xterm.write("\r\n");
    }
  }

  readLine(prompt: string): Promise<string> {
    return this.input.read(prompt);
  }

  private onResize = (): void => {
    this.resizeEmitter.emit({ fit: false });
    this.fitAddon.fit();
    this.resizeEmitter.emit({ fit: true });
  };

  private onKeyboardEvent = (e: KeyboardEvent): boolean => {
    if (this.keyboardHandler) {
      return this.keyboardHandler(e);
    }

    return true;
  };

  public addResizeEventListener(listener: EventListener<ResizeEvent>): void {
    this.resizeEmitter.addListener(listener);
  }

  public addClearEventListener(listener: EventListener<ClearTTYEvent>): void {
    this.clearTTYEmitter.addListener(listener);
  }

  public addKeyboardHandler(handler: KeyboardHandler) {
    this.keyboardHandler = handler;
  }

  public removeKeyboardHanlder(): void {
    this.keyboardHandler = null;
  }

  public get cols(): number {
    return this.xterm.cols;
  }

  public get rows(): number {
    return this.xterm.rows;
  }
}
