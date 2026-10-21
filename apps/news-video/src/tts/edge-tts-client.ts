import { EdgeTTS, createSRT } from "edge-tts-universal";
import { writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { TtsClient, TtsGenerateOptions } from "./tts-client.js";

const execFileAsync = promisify(execFile);

function findEdgeTtsBinary(): string | null {
  if (process.env.VITEST) return null;
  const localVenv = join(process.cwd(), ".venv", "bin", "edge-tts");
  if (existsSync(localVenv)) return localVenv;
  return null;
}

export interface EdgeTtsOpts {
  voice: string;         // e.g. "vi-VN-HoaiMyNeural" or "vi-VN-NamMinhNeural"
  rate?: string;         // e.g. "+0%", "+10%", "-5%"
  pitch?: string;        // e.g. "+0Hz"
  volume?: string;       // e.g. "+0%"
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Edge TTS client using Microsoft Edge online text-to-speech service (Free).
 * Powered by `edge-tts-universal` with fallback to local python `edge-tts` CLI.
 *
 * Supports subtitle generation (SRT) via word boundary cues.
 */
export class EdgeTtsClient implements TtsClient {
  constructor(private cfg: EdgeTtsOpts) {}

  async generate(
    text: string,
    audioOutPath: string,
    srtOutPath?: string,
    options?: TtsGenerateOptions,
  ): Promise<void> {
    await this.synthesizeWithRetry(text, audioOutPath, srtOutPath, options);
  }

  private async synthesizeWithRetry(
    text: string,
    audioOutPath: string,
    srtOutPath?: string,
    options?: TtsGenerateOptions,
  ): Promise<void> {
    const delays = [1000, 2000, 4000];
    const speed = options?.speed;
    const rate =
      speed !== undefined && speed !== 1
        ? `${speed > 1 ? "+" : ""}${Math.round((speed - 1) * 100)}%`
        : this.cfg.rate ?? "+0%";
    let lastErr: unknown;

    const bin = findEdgeTtsBinary();
    if (bin) {
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          const args = [
            "--voice", this.cfg.voice,
            "--text", text,
            "--write-media", audioOutPath,
            "--no-progress",
          ];
          if (rate && rate !== "+0%") {
            args.push("--rate", rate);
          }
          if (this.cfg.pitch && this.cfg.pitch !== "+0Hz") {
            args.push("--pitch", this.cfg.pitch);
          }
          if (this.cfg.volume && this.cfg.volume !== "+0%") {
            args.push("--volume", this.cfg.volume);
          }
          if (srtOutPath) {
            args.push("--write-subtitles", srtOutPath);
          }
          await execFileAsync(bin, args);
          return;
        } catch (e) {
          lastErr = e;
          if (attempt === delays.length) throw e;
          await sleep(delays[attempt]);
        }
      }
      throw lastErr;
    }

    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const tts = new EdgeTTS(text, this.cfg.voice, {
          rate,
          pitch: this.cfg.pitch ?? "+0Hz",
          volume: this.cfg.volume ?? "+0%",
        });

        const result = await tts.synthesize();
        const buffer = Buffer.from(await result.audio.arrayBuffer());
        if (buffer.length === 0) {
          throw new Error("Edge TTS returned empty audio buffer");
        }
        await writeFile(audioOutPath, buffer);

        if (srtOutPath && result.subtitle && result.subtitle.length > 0) {
          const srtContent = createSRT(result.subtitle);
          await writeFile(srtOutPath, srtContent, "utf8");
        }
        return;
      } catch (e) {
        lastErr = e;
        if (attempt === delays.length) throw e;
        await sleep(delays[attempt]);
      }
    }
    throw lastErr;
  }
}
