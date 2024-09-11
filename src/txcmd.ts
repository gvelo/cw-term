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

import { Terminal } from "./Terminal";
import { Tx } from "./tx";
import { theme } from "./theme";

type TxConfigProperty = "wpm" | "eff" | "freq" | "volume";
const txConfigKeys: TxConfigProperty[] = ["wpm", "eff", "freq", "volume"];

interface TxConfigCmd {
  action: "show" | "set";
  property?: TxConfigProperty;
  value?: number;
}

interface TxSendCmd {
  message: string;
  wpm?: number;
  eff?: number;
  freq?: number;
  volume?: number;
}

export class TxCommand {
  private terminal: Terminal;
  private tx: Tx;

  constructor(terminal: Terminal, tx: Tx) {
    this.terminal = terminal;
    this.tx = tx;
  }

  printUsage(): void {
    this.terminal.writeln(`
Usage: tx <command> [options]

Commands:
  config                       Show the tx config values
  config --show                Show the tx config values
  config --set <property> <value>  Set a config property value

  Available properties for config --set:
    wpm     Set the character speed (words per minute)
    eff     Set the effective speed
    freq    Set the tone frequency (Hertz)
    volume  Set the volume (0-100)

  send [options] <message>     Send a Morse code message

Options for send:
  --wpm <int>     Set the character speed for this message
  --eff <int>     Set the effective speed for this message
  --freq <int>    Set the tone frequency for this message
  --volume <int>  Set the volume for this message (0-100)

Examples:
  tx config
  tx config --set wpm 20
  tx config --set volume 75
  tx send "Hello World"
  tx send --eff 15 --wpm 20 "CQ CQ CQ"
`);
  }

  async exec(args: string[]) {
    // Remove the first two elements (node executable and script name)
    const [command, ...restArgs] = args.slice(1);
    try {
      switch (command) {
        case "config":
          this.execConfigCmd(this.parseConfigCommand(restArgs));
          break;
        case "send":
          await this.execSendCmd(this.parseSendCommand(restArgs));
          break;
        case "--help":
        case "-h":
          this.printUsage();
          break;
        default:
          this.terminal.writeln('Invalid command. Use "config" or "send".');
          this.printUsage();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.terminal.writeln(`Error: ${error.message}`);
        this.terminal.writeln("For more information, use --help");
      } else {
        this.terminal.writeln(String(error));
      }
    }
  }

  private parseConfigCommand(args: string[]): TxConfigCmd {
    if (args.length === 0 || args[0] === "--show") {
      return { action: "show" };
    }

    if (args[0] === "--set" && args.length === 3) {
      const [, property, value] = args;
      if (["wpm", "eff", "freq", "volume"].includes(property)) {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue)) {
          throw new Error(
            `Invalid value for ${property}: ${value}. Must be a number.`
          );
        }
        return {
          action: "set",
          property: property as TxConfigCmd["property"],
          value: numValue,
        };
      }
    }

    throw new Error("Invalid config command");
  }

  private parseSendCommand(args: string[]): TxSendCmd {
    const cmd: TxSendCmd = { message: "" };
    let i = 0;

    function parseNumericArg(argName: string): number {
      const value = parseInt(args[++i], 10);
      if (isNaN(value)) {
        throw new Error(
          `Invalid value for ${argName}: ${args[i]}. Must be a number.`
        );
      }
      return value;
    }

    while (i < args.length) {
      switch (args[i]) {
        case "--eff":
          cmd.eff = parseNumericArg("eff");
          break;
        case "--wpm":
          cmd.wpm = parseNumericArg("wpm");
          break;
        case "--freq":
          cmd.freq = parseNumericArg("freq");
          break;
        case "--volume":
          cmd.volume = parseNumericArg("volume");
          break;
        default:
          if (args[i].startsWith("--") || args[i].startsWith("-")) {
            throw new Error(`Unknown option: ${args[i]}`);
          }
          // Assume the rest is the message
          cmd.message = args.slice(i).join(" ");
          return cmd;
      }
      i++;
    }

    if (!cmd.message) {
      throw new Error("Invalid send command: message is required");
    }

    return cmd;
  }

  private execConfigCmd(cmd: TxConfigCmd): void {
    if (cmd.action === "show") {
      this.showConfig();
    } else if (cmd.property && cmd.value !== undefined) {
      this.setConfig(cmd.property, cmd.value);
    }
  }

  private showConfig() {
    this.terminal.writeln();
    this.terminal.writeln(theme.info("tx configuration:"));
    this.terminal.writeln();

    for (const key of txConfigKeys) {
      this.terminal.write(key);
      this.terminal.write("\t");
      this.terminal.writeln(theme.info(String(this.tx[key])));
    }

    this.terminal.writeln();
  }

  private setConfig(property: TxConfigProperty, value: number): void {
    if (property in this.tx) {
      this.tx[property] = value;
      this.terminal.write(`\n ${property} set to ${theme.info(value)} \n\n`);
    }
  }

  private async execSendCmd(cmd: TxSendCmd) {
    let resolve: (value: void | PromiseLike<void>) => void;

    const promise = new Promise<void>((res) => {
      resolve = res;
    });

    const onTxStop = () => {
      this.tx.removeStopEventListener(onTxStop);
      resolve();
    };

    this.tx.addStopEventListener(onTxStop);

    this.tx.send(cmd.message, cmd.wpm, cmd.eff, cmd.freq, cmd.volume);

    return promise;
  }
}
