import { Terminal } from "./Terminal";
import { Cw } from "./cw";
import { Config } from "./config";

export interface App {
  processLine(line: string[]): void;
  prompt(): string;
  allowLineEnter(): boolean;
}
