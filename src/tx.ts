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
import { EventEmitter, EventListener } from "./emiter";

const CONF_STORAGE_KEY = "tx";

export type TxStartEvent = {
  message: string;
};

export type TxStopEvent = {
  message: string;
};

export type TxCharEvent = {
  message: string;
  idx: number;
};

export type TxConfChange = {
  conf: TxConfig;
};

export interface TxConfig {
  wpm: number;
  eff: number;
  freq: number;
  volume: number;
}

export class Tx {
  private readonly jscw: jscw;
  private _message: string;
  private txCharIdx: number;

  private readonly startEmitter: EventEmitter<TxStartEvent>;
  private readonly stopEmitter: EventEmitter<TxStopEvent>;
  private readonly charEmitter: EventEmitter<TxCharEvent>;
  private readonly confEmitter: EventEmitter<TxConfChange>;
  private readonly conf: TxConfig;
  private readonly storage: ConfStorage;

  constructor(storage: ConfStorage) {
    this.jscw = new jscw();

    this._message = "";
    this.txCharIdx = 0;

    this.startEmitter = new EventEmitter<TxStartEvent>();
    this.stopEmitter = new EventEmitter<TxStopEvent>();
    this.charEmitter = new EventEmitter<TxCharEvent>();
    this.confEmitter = new EventEmitter<TxConfChange>();

    this.jscw.onFinished = () => this.handleStop();
    this.jscw.onPlay = () => this.handlePlay();
    this.jscw.onCharacterPlay = () => this.handlePlayingCharacter();

    this.storage = storage;
    this.conf = storage.get(CONF_STORAGE_KEY) ?? {
      wpm: 20,
      eff: 0,
      freq: 600,
      volume: 0.5,
    };
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

    const txWpp = wpm ?? this.conf.wpm;
    const txEff = eff ?? this.conf.eff;
    const txFreq = freq ?? this.conf.freq;
    const txVolume = volume ?? this.conf.volume;

    this.jscw.setWpm(txWpp);
    this.jscw.setEff(txEff);
    this.jscw.setVolume(txVolume);
    this.jscw.setFreq(txFreq);
    this.jscw.play(message);
  }

  stop(): void {
    this.jscw.stop();
    this.stopEmitter.emit({ message: this.message });
  }

  public get wpm(): number {
    return this.conf.wpm;
  }

  public set wpm(wpm: number) {
    this.conf.wpm = wpm;
    this.saveConf();
  }

  public get eff(): number {
    return this.conf.eff;
  }

  public set eff(eff: number) {
    this.conf.eff = eff;
    this.saveConf();
  }

  public get freq(): number {
    return this.conf.freq;
  }

  public set freq(freq: number) {
    this.conf.freq = freq;
    this.saveConf();
  }

  public set volume(vol: number) {
    this.conf.volume = vol;
    this.saveConf();
  }

  public get volume(): number {
    return this.conf.volume;
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

  public addConfEventListener(listener: EventListener<TxConfChange>): void {
    this.confEmitter.addListener(listener);
  }

  private handleStop(): void {
    this.stopEmitter.emit({ message: this._message });
  }

  private handlePlay(): void {
    this.startEmitter.emit({ message: this._message });
  }

  private handlePlayingCharacter(): void {
    this.charEmitter.emit({
      message: this._message,
      idx: this.txCharIdx,
    });
    this.txCharIdx++;
  }

  private saveConf() {
    this.storage.set(CONF_STORAGE_KEY, this.conf);
    this.confEmitter.emit({ conf: this.conf });
  }
}
