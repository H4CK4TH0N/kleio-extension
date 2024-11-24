import type { PlasmoMessaging } from "@plasmohq/messaging"
import { contentRequestSchema } from "@/lib/schema"
import { Storage } from "@plasmohq/storage"

const storage = new Storage()

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const email = await storage.get("email")
  if (!email) {
    res.send("Unauthorized")
    return
  }

  const parsedBody = contentRequestSchema.safeParse(req.body)
  if (!parsedBody.success) {
    res.send(parsedBody.error.errors)
    return
  }
  const { id, startTime, endTime, participants, transcript } = parsedBody.data

  try {
    const saveMeetingRes = fetch(`${process.env.PLASMO_PUBLIC_API}/api/meeting`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id,
        email,
        startTime,
        endTime,
        participants,
      })
    })

    const signedUrlRes = fetch(`${process.env.PLASMO_PUBLIC_API}/api/signed-url/${id}`)
    
    const [saveMeetingResponse, signedUrlResponse] = await Promise.all([saveMeetingRes, signedUrlRes])

    if (!saveMeetingResponse.ok) {
      res.send(await saveMeetingResponse.text())
      return
    }

    const signedUrlData = await signedUrlResponse.json()
    const signedUrl = signedUrlData.url as string

    const uploadTranscriptRes = fetch(signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id,
        email,
        startTime,
        endTime,
        participants,
        transcript
      })
    })

    const webhookRes = fetch(`${process.env.PLASMO_PUBLIC_WEBHOOK_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id,
        email,
        startTime,
        endTime,
        participants,
        transcript
      })
    })

    const [uploadTranscriptResponse, webhookResponse] = await Promise.all([uploadTranscriptRes, webhookRes])

    if (!uploadTranscriptResponse.ok) {
      res.send(await uploadTranscriptResponse.text())
      return
    }

    if (!webhookResponse.ok) {
      res.send(await webhookResponse.text())
      return
    }

    res.send(req.body)
  } catch (error) {
    res.send(`Error: ${error.message}`)
  }
}

export default handler