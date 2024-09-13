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

import { ConfStorage } from "./config";
import { Tx } from "./tx";
import { Terminal } from "./Terminal";
import { TxCommand } from "./txcmd";
import { StatusBar } from "./statusbar";

export class RootApp {
  private terminal: Terminal;
  private tx: Tx;
  private storage: ConfStorage;
  private txCmd: TxCommand;
  private statusBar: StatusBar;

  constructor(terminal: Terminal) {
    this.terminal = terminal;
    this.storage = new ConfStorage();
    this.tx = new Tx(this.storage);
    this.txCmd = new TxCommand(this.terminal, this.tx);
    this.statusBar = new StatusBar(this.terminal, this.tx);
  }

  async start() {
    while (true) {
      const prompt = "cw-console: ";
      const line = await this.terminal.readLine(prompt);
      if (line) {
        await this.processLine(line);
      }
    }
  }

  async processLine(line: string) {
    console.log(line);
    const argv = this.parseCommandLine(line);
    console.log(argv);
    if (argv) {
      const cmd = argv[0];
      switch (cmd) {
        case "help":
          this.printAppHelp();
          break;
        case "kock":
          break;
        case "tx":
          await this.txCmd.exec(argv);
          break;

        default:
          this.terminal.writeln(`command not found: ${cmd}`);
          break;
      }
    }
  }

  parseCommandLine(command: string): string[] {
    const argv: string[] = [];
    let currentArg = "";
    let inQuotes = false;
    let escape = false;

    for (let i = 0; i < command.length; i++) {
      const char = command[i];

      if (escape) {
        currentArg += char;
        escape = false;
      } else if (char === "\\") {
        escape = true;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === " " && !inQuotes) {
        if (currentArg.length > 0) {
          argv.push(currentArg);
          currentArg = "";
        }
      } else {
        currentArg += char;
      }
    }

    if (currentArg.length > 0) {
      argv.push(currentArg);
    }

    return argv;
  }

  printAppHelp() {
    this.terminal.writeln("help");
  }
}
