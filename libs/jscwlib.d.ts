declare class jscw {
    constructor();

    init(): void;
    setWpm(x: number): void;
    setEff(x: number): void;
    setReal(bool: boolean): void;
    setEws(n: number): void;
    setFreq(x: number): void;
    setFilter(f: number): void;
    setQ(q: number): void;
    setText(text: string): void;
    setTextB64(text: string): void;
    setVolume(v: number): void;
    play(text?: string): void;
    pause(): void;
    stop(): void;
    setStartDelay(s: number): void;
    setPrefix(p: string): void;
    setSuffix(s: string): void;
    enablePS(b: boolean): void;
    getLength(): number;
    getRemaining(): number;
    getTime(): number;
    draw(c: HTMLCanvasElement): void;
    renderPlayer(div: HTMLDivElement, obj: any): void;
    oscilloscope(c: HTMLCanvasElement): void;

    onParamChange: (() => void) | null;
    onPlay: (() => void) | null;
    onFinished: (() => void) | null;
    onCharacterPlay: ((c: string) => void) | null;
}

