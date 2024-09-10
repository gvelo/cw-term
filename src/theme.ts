import { Chalk, ChalkInstance } from "chalk";

export const colors = new Chalk({ level: 3 });

interface Theme {
  readonly error: ChalkInstance;
  readonly info: ChalkInstance;
}

const defaultTheme: Theme = {
  error: colors.redBright,
  info: colors.yellowBright,
};

export const theme = defaultTheme;
