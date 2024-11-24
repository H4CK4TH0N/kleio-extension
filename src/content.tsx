import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useRef } from "react"

import { sendToBackground } from "@plasmohq/messaging"

export const config: PlasmoCSConfig = {
  matches: ["https://meet.google.com/*"],
  exclude_matches: ["https://meet.google.com/"]
}

type TranscriptBlock = {
  personName: string
  timestamp: string
  text: string
}

const MeetTranscriber = () => {
  const transcriptsRef = useRef<TranscriptBlock[]>([])
  const meetingTitleRef = useRef<string>("")
  const usernameRef = useRef<string>("You")
  const participantsRef = useRef<string[]>([])
  const meetingStartTimeRef = useRef<string>("")
  const observerRef = useRef<MutationObserver | null>(null)
  const bufferRef = useRef<TranscriptBlock>({
    personName: "",
    timestamp: "",
    text: ""
  })
  const beforeTranscriptTextRef = useRef("")

  // Initialize the meeting
  useEffect(() => {
    const initializeMeeting = async () => {
      const endButton = await waitForElement('button[aria-label="Leave call"]')
      if (endButton) {
        const startTime = new Date().toISOString()
        meetingStartTimeRef.current = startTime
        endButton.addEventListener("click", handleMeetingEnd)

        const captionsButton = await waitForElement(
          "[aria-label='Turn on captions']"
        )
        if (captionsButton) {
          ;(captionsButton as HTMLElement).click()
        }

        const transcriptElement = document.querySelector(".a4cQT")
        if (transcriptElement) {
          observerRef.current = new MutationObserver(handleTranscriptMutation)
          observerRef.current.observe(transcriptElement, {
            childList: true,
            attributes: true,
            subtree: true
          })
        }
      }
    }
    initializeMeeting()

    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  // Capture the username
  useEffect(() => {
    const captureUserName = async () => {
      const userNameElement = await waitForElement(".dwSJ2e")
      if (userNameElement) {
        const userName = userNameElement.textContent
        usernameRef.current = userName
        if (!participantsRef.current.includes(userName)) {
          participantsRef.current = [...participantsRef.current, userName]
        }
      }
    }

    captureUserName()
  }, [])

  // Capture the meeting title
  useEffect(() => {
    const updatedMeetingTitle = async () => {
      const titleElement = await waitForElement(".u6vdEc")
      if (
        titleElement &&
        titleElement.textContent &&
        titleElement.textContent.split("-").length === 3
      ) {
        const title = titleElement.textContent
        meetingTitleRef.current = title
        return true
      }
      return false
    }

    const intervalId = setInterval(async () => {
      const found = await updatedMeetingTitle()
      if (found) {
        clearInterval(intervalId)
      }
    }, 5000)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  // Dim down
  useEffect(() => {
    async function dimTranscript() {
      const transcriptElement = await waitForElement(".a4cQT")
      if (transcriptElement) {
        try {
          ;(transcriptElement.firstChild as HTMLElement).style.opacity = "0.2"
        } catch (error) {
          console.error(error)
        }

        observerRef.current = new MutationObserver(handleTranscriptMutation)
        observerRef.current.observe(transcriptElement, {
          childList: true,
          subtree: true
        })
      }
    }

    dimTranscript()

    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  const handleTranscriptMutation = (mutationsList: MutationRecord[]) => {
    mutationsList.forEach(() => {
      try {
        const people =
          document.querySelector(".a4cQT")?.firstChild?.firstChild?.childNodes

        if (people && people.length > 0) {
          const lastPerson = people[people.length - 1] as HTMLElement
          const currentPersonName =
            lastPerson.childNodes[0]?.textContent || "Unknown Speaker"
          const currentTranscriptText =
            lastPerson.childNodes[1]?.lastChild?.textContent || ""

          if (!participantsRef.current.includes(currentPersonName)) {
            participantsRef.current = [
              ...participantsRef.current,
              currentPersonName
            ]
          }

          if (beforeTranscriptTextRef.current === "") {
            bufferRef.current = {
              personName: currentPersonName,
              timestamp: new Date().toISOString(),
              text: currentTranscriptText
            }
            beforeTranscriptTextRef.current = currentTranscriptText
          } else {
            if (bufferRef.current.personName !== currentPersonName) {
              transcriptsRef.current = [
                ...transcriptsRef.current,
                { ...bufferRef.current }
              ]
              bufferRef.current = {
                personName: currentPersonName,
                timestamp: new Date().toISOString(),
                text: currentTranscriptText
              }
            } else {
              bufferRef.current.text = currentTranscriptText
              if (currentTranscriptText.length > 250) {
                lastPerson.remove()
              }
            }
            beforeTranscriptTextRef.current = currentTranscriptText
          }
        } else {
          if (bufferRef.current.personName && bufferRef.current.text) {
            transcriptsRef.current = [
              ...transcriptsRef.current,
              { ...bufferRef.current }
            ]
            bufferRef.current = { personName: "", timestamp: "", text: "" }
            beforeTranscriptTextRef.current = ""
          }
        }
      } catch (error) {
        console.error("Error in transcript mutation handler:", error)
      }
    })
  }

  const waitForElement = (
    selector: string,
    text?: string
  ): Promise<Element | null> => {
    return new Promise((resolve) => {
      const checkElement = () => {
        const element = text
          ? Array.from(document.querySelectorAll(selector)).find(
              (el) => el.textContent === text
            )
          : document.querySelector(selector)
        if (element) {
          resolve(element)
        } else {
          requestAnimationFrame(checkElement)
        }
      }
      checkElement()
    })
  }

  const handleMeetingEnd = async () => {
    observerRef.current?.disconnect()
    if (bufferRef.current.personName && bufferRef.current.text) {
      transcriptsRef.current = [
        ...transcriptsRef.current,
        { ...bufferRef.current }
      ]
    }

    try {
      if (participantsRef.current.includes("You") && participantsRef.current.includes(usernameRef.current)) {
        participantsRef.current = participantsRef.current.filter(
          (participant) => participant !== "You"
        )
      }

      const resp = await sendToBackground({
        name: "send",
        body: {
          id: meetingTitleRef.current,
          startTime: meetingStartTimeRef.current,
          endTime: new Date().toISOString(),
          participants: participantsRef.current,
          transcript: transcriptsRef.current
        }
      })
    } catch (error) {
      console.error("Error sending transcript to background:", error)
    }
    
  }

  return null
}

export default MeetTranscriber
