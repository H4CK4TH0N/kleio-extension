import * as z from "zod";

export type TranscriptBlock = {
  personName: string
  timestamp: string
  text: string
}

const TranscriptBlockSchema = z.object({
  personName: z.string().min(1),
  timestamp: z.string().min(1),
  text: z.string().min(1)
})

const TranscriptSchema = z.array(TranscriptBlockSchema)

export const contentRequestSchema = z.object({
  id: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  participants: z.array(z.string().min(1)),
  transcript: TranscriptSchema
})