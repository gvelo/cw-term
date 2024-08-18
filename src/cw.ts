export enum Status {
  Playing = "playing",
  Stopped = "stopped",
}

export class Cw {
  private jscw: jscw;
  private status: Status;
  private messageLen: number;
  private playedCharCount: number;
  private onPlayCb: (() => void) | null;
  private onStopCb: (() => void) | null;
  private onPlayCharacterCb: ((char: string) => void) | null;
  private _wpm: number;
  private _eff: number;
  private _freq: number;

  constructor() {
    this.jscw = new jscw();
    this.status = Status.Stopped;
    this.messageLen = 0;
    this.playedCharCount = 0;
    this.onPlayCb = null;
    this.onStopCb = null;
    this.onPlayCharacterCb = null;
    this._eff = 0;
    this._wpm = 0;
    this._freq = 0;
    this.jscw.onFinished = this.handleStop;
    this.jscw.onPlay = this.handlePlay;
    this.jscw.onCharacterPlay = this.handlePlayingCharacter;
  }

  play(message: string): void {
    this.messageLen = message.length;
    this.playedCharCount = 0;
    this.jscw.play(message);
  }

  stop(): void {
    this.jscw.stop();
  }

  set onPlay(cb: () => void) {
    this.onPlayCb = cb;
  }

  set onPlayCharacter(cb: (c: string) => void) {
    this.onPlayCharacterCb = cb;
  }

  set onStop(cb: () => void) {
    this.onStopCb = cb;
  }

  private handleStop(): void {
    this.status = Status.Stopped;
    this.onStop();
    if (this.onStopCb) {
      this.onStopCb();
    }
  }

  private handlePlay(): void {
    this.status = Status.Playing;
    if (this.onPlayCb) {
      this.onPlayCb();
    }
  }

  private handlePlayingCharacter(char: string): void {
    this.playedCharCount++;
    if (this.onPlayCharacterCb) {
      this.onPlayCharacterCb(char);
    }
  }

  public get wpm(): number {
    return this._wpm;
  }

  public set wpm(wpm: number) {
    this.jscw.setWpm(wpm);
    this._wpm = wpm;
  }

  public get eff(): number {
    return this._eff;
  }

  public set eff(eff: number) {
    this.jscw.setEff(eff);
    this._eff = eff;
  }

  public get freq(): number {
    return this._freq;
  }

  public set freq(freq: number) {
    this.jscw.setFreq(freq);
    this._freq = freq;
  }
}
