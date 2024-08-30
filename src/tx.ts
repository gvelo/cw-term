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

import { EventEmitter, EventListener } from "./emiter";

type TxStartEvent = {
  message: string;
};

type TxStopEvent = {
  message: string;
};

type TxCharEvent = {
  message: string;
  idx: number;
};

export class Tx {
  private readonly jscw: jscw;
  private _message: string;
  private txCharIdx: number;

  private readonly startEmitter: EventEmitter<TxStartEvent>;
  private readonly stopEmitter: EventEmitter<TxStopEvent>;
  private readonly charEmitter: EventEmitter<TxCharEvent>;

  private _wpm: number;
  private _eff: number;
  private _freq: number;
  private _volume: number;

  constructor() {
    this.jscw = new jscw();

    this._message = "";
    this.txCharIdx = 0;
    this._eff = 0;
    this._wpm = 0;
    this._freq = 0;
    this._volume = 0;

    this.startEmitter = new EventEmitter<TxStartEvent>();
    this.stopEmitter = new EventEmitter<TxStopEvent>();
    this.charEmitter = new EventEmitter<TxCharEvent>();

    this.jscw.onFinished = () => this.handleStop();
    this.jscw.onPlay = () => this.handlePlay();
    this.jscw.onCharacterPlay = () => this.handlePlayingCharacter();
  }

  send(
    message: string,
    wpm?: number,
    eff?: number,
    freq?: number,
    volume?: number
  ): void {
    this._message = message;
    this.txCharIdx = 0;

    const txWpp = wpm ?? this._wpm;
    const txEff = eff ?? this._eff;
    const txFreq = freq ?? this._freq;
    const txVolume = volume ?? this._volume;

    this.jscw.setWpm(txWpp);
    this.jscw.setEff(txEff);
    this.jscw.setVolume(txVolume);
    this.jscw.setFreq(txFreq);
    this.jscw.play(message);
  }

  stop(): void {
    this.jscw.stop();
  }

  public get wpm(): number {
    return this._wpm;
  }

  public set wpm(wpm: number) {
    // TODO: save to config.
    this._wpm = wpm;
  }

  public get eff(): number {
    return this._eff;
  }

  public set eff(eff: number) {
    // TODO: save to config.
    this._eff = eff;
  }

  public get freq(): number {
    return this._freq;
  }

  public set freq(freq: number) {
    // TODO: save to config.
    this._freq = freq;
  }

  public set volume(vol: number) {
    // TODO: save to config.
    this._volume = vol;
  }

  public get volume(): number {
    return this._volume;
  }

  public get message(): string {
    return this._message;
  }

  public addStartEventListener(listener: EventListener<TxStartEvent>): void {
    this.startEmitter.addListener(listener);
  }

  public removeStartEventListener(listener: EventListener<TxStartEvent>): void {
    this.startEmitter.removeListener(listener);
  }

  public addStopEventListener(listener: EventListener<TxStopEvent>): void {
    this.stopEmitter.addListener(listener);
  }

  public removeStopEventListener(listener: EventListener<TxStopEvent>): void {
    this.stopEmitter.removeListener(listener);
  }

  public addCharEventListener(listener: EventListener<TxCharEvent>): void {
    this.charEmitter.addListener(listener);
  }

  public removeCharEventListener(listener: EventListener<TxCharEvent>): void {
    this.charEmitter.removeListener(listener);
  }

  private handleStop(): void {
    this.stopEmitter.emit({ message: this._message });
  }

  private handlePlay(): void {
    this.startEmitter.emit({ message: this._message });
  }

  private handlePlayingCharacter(): void {
    this.txCharIdx++;
    this.charEmitter.emit({
      message: this._message,
      idx: this.txCharIdx,
    });
  }
}
