import { z } from "zod";

export const dockerExplainerSchema = z.object({
  title: z.string().default("Docker là gì?"),
  subtitle: z.string().default("Giải thích trong 60 giây"),
  channelName: z.string().default("DuyNQ"),
});

export type DockerExplainerProps = z.infer<typeof dockerExplainerSchema>;
