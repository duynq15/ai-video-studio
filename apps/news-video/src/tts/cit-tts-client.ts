import axios, { AxiosError } from "axios";
import { writeFile } from "node:fs/promises";
import type { TtsClient, TtsGenerateOptions } from "./tts-client.js";

export interface CitTtsOpts {
  /** Base URL of CIT Voice Studio, e.g. "http://127.0.0.1:8001" */
  endpoint: string;
  /** Optional — only needed when calling from another machine / tunnel. */
  apiKey?: string;
  /** Voice name shown in CIT Voice Studio ("Minh Đức", "Hải Đăng"...). Empty = model default. */
  voiceId?: string;
  speed: number;
  format: "mp3" | "wav";
  timeoutMs: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * CIT Voice Studio client (https://github.com/Cuongyd196/cit-voice-studio).
 *
 * Runs locally at http://127.0.0.1:8001 by default, no API key required.
 * Endpoint: POST /api/tts/generate → raw audio bytes.
 * The local API has no SRT output, so `srtOutPath` is ignored.
 */
export class CitTtsClient implements TtsClient {
  private healthChecked = false;

  constructor(private cfg: CitTtsOpts) {}

  async generate(
    text: string,
    audioOutPath: string,
    _srtOutPath?: string,
    options?: TtsGenerateOptions,
  ): Promise<void> {
    await this.ensureHealthy();
    const buffer = await this.synthesizeWithRetry(text, options?.speed);
    if (buffer.length === 0) throw new Error("CIT Voice Studio returned empty audio");
    await writeFile(audioOutPath, buffer);
  }

  private baseUrl(): string {
    return this.cfg.endpoint.trim().replace(/\/+$/, "");
  }

  private headers(extra: Record<string, string> = {}): Record<string, string> {
    const headers = { ...extra };
    if (this.cfg.apiKey?.trim()) headers["X-API-Key"] = this.cfg.apiKey.trim();
    return headers;
  }

  /** Fail fast with a readable message when the app is not running. */
  private async ensureHealthy(): Promise<void> {
    if (this.healthChecked) return;
    const url = `${this.baseUrl()}/health`;
    try {
      const res = await axios.get(url, {
        headers: this.headers(),
        timeout: 5000,
        validateStatus: () => true,
      });
      if (res.status >= 400) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (e) {
      throw new Error(
        `Cannot connect to CIT Voice Studio at ${url}. ` +
        `Mở ứng dụng CIT Voice Studio (API mặc định cổng 8001) rồi chạy lại. ` +
        `Chi tiết: ${(e as Error).message}`,
      );
    }
    this.healthChecked = true;
  }

  private async synthesizeWithRetry(text: string, speedOverride?: number): Promise<Buffer> {
    const delays = [1000, 2000, 4000];
    const speed = speedOverride ?? this.cfg.speed;
    let lastErr: unknown;

    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const body: Record<string, unknown> = {
          text,
          speed,
          format: this.cfg.format,
          use_pronunciation_dict: true,
        };
        const voiceId = this.cfg.voiceId?.trim();
        if (voiceId && voiceId.toLowerCase() !== "default" && voiceId !== "(default)") {
          body.voice_id = voiceId;
        }

        const res = await axios.post<ArrayBuffer>(`${this.baseUrl()}/api/tts/generate`, body, {
          headers: this.headers({
            "Content-Type": "application/json",
            Accept: "audio/mpeg, audio/wav, application/octet-stream",
          }),
          responseType: "arraybuffer",
          timeout: this.cfg.timeoutMs,
        });
        return Buffer.from(res.data);
      } catch (e) {
        lastErr = e;
        const status = (e as AxiosError).response?.status;
        // 4xx won't fix itself (unknown voice, bad key, unsupported format).
        const retryable = status === undefined || status >= 500;
        if (!retryable || attempt === delays.length) {
          const err = e as AxiosError;
          let detail = err.message;
          if (err.response?.data) {
            try {
              detail = Buffer.from(err.response.data as ArrayBuffer).toString("utf8") || detail;
            } catch { /* keep axios message */ }
          }
          throw new Error(`CIT Voice Studio TTS failed (status ${status ?? "?"}): ${detail}`);
        }
        await sleep(delays[attempt]);
      }
    }
    throw lastErr;
  }
}
