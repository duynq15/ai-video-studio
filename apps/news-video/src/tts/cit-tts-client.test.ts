import { describe, it, expect, beforeEach, afterEach } from "vitest";
import nock from "nock";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { CitTtsClient } from "./cit-tts-client.js";

const ENDPOINT = "http://127.0.0.1:8001";

let tmpDir: string;

beforeEach(() => {
  nock.cleanAll();
  tmpDir = mkdtempSync(join(tmpdir(), "cit-tts-test-"));
});

afterEach(() => {
  nock.cleanAll();
  rmSync(tmpDir, { recursive: true, force: true });
});

function opts(overrides: Partial<ConstructorParameters<typeof CitTtsClient>[0]> = {}) {
  return {
    endpoint: ENDPOINT,
    voiceId: "Minh Đức",
    speed: 1.0,
    format: "mp3" as const,
    timeoutMs: 5000,
    ...overrides,
  };
}

describe("CitTtsClient", () => {
  it("checks /health, posts text and writes audio", async () => {
    nock(ENDPOINT).get("/health").reply(200, { status: "ok" });
    nock(ENDPOINT)
      .post("/api/tts/generate", (b: any) =>
        b.text === "Xin chào" && b.voice_id === "Minh Đức" && b.format === "mp3")
      .reply(200, Buffer.from("MP3DATA"), { "content-type": "audio/mpeg" });

    const client = new CitTtsClient(opts());
    const out = join(tmpDir, "out.mp3");
    await client.generate("Xin chào", out);

    expect(readFileSync(out).toString()).toBe("MP3DATA");
  });

  it("sends X-API-Key when configured", async () => {
    nock(ENDPOINT).get("/health").matchHeader("X-API-Key", "secret").reply(200, {});
    nock(ENDPOINT)
      .post("/api/tts/generate")
      .matchHeader("X-API-Key", "secret")
      .reply(200, Buffer.from("OK"), { "content-type": "audio/mpeg" });

    const client = new CitTtsClient(opts({ apiKey: "secret" }));
    await client.generate("hi", join(tmpDir, "out.mp3"));
  });

  it("omits voice_id for the default voice placeholder", async () => {
    nock(ENDPOINT).get("/health").reply(200, {});
    nock(ENDPOINT)
      .post("/api/tts/generate", (b: any) => b.voice_id === undefined)
      .reply(200, Buffer.from("OK"), { "content-type": "audio/mpeg" });

    const client = new CitTtsClient(opts({ voiceId: "(default)" }));
    await client.generate("hi", join(tmpDir, "out.mp3"));
  });

  it("passes per-scene speed override and wav format", async () => {
    nock(ENDPOINT).get("/health").reply(200, {});
    nock(ENDPOINT)
      .post("/api/tts/generate", (b: any) => b.speed === 1.2 && b.format === "wav")
      .reply(200, Buffer.from("WAVDATA"), { "content-type": "audio/wav" });

    const client = new CitTtsClient(opts({ format: "wav" }));
    await client.generate("hi", join(tmpDir, "out.wav"), undefined, { speed: 1.2 });
  });

  it("retries on 5xx and succeeds", async () => {
    nock(ENDPOINT).get("/health").reply(200, {});
    nock(ENDPOINT).post("/api/tts/generate").reply(503, "loading");
    nock(ENDPOINT).post("/api/tts/generate").reply(200, Buffer.from("OK"));

    const client = new CitTtsClient(opts());
    const out = join(tmpDir, "out.mp3");
    await client.generate("hi", out);
    expect(readFileSync(out).toString()).toBe("OK");
  }, 10000);

  it("throws a readable error when the app is not running", async () => {
    nock(ENDPOINT).get("/health").replyWithError("ECONNREFUSED");

    const client = new CitTtsClient(opts());
    await expect(client.generate("hi", join(tmpDir, "out.mp3")))
      .rejects.toThrow(/Cannot connect to CIT Voice Studio/);
  });

  it("does not retry on 4xx", async () => {
    nock(ENDPOINT).get("/health").reply(200, {});
    nock(ENDPOINT).post("/api/tts/generate").reply(422, "unknown voice");

    const client = new CitTtsClient(opts());
    await expect(client.generate("hi", join(tmpDir, "out.mp3")))
      .rejects.toThrow(/unknown voice/);
  });
});
