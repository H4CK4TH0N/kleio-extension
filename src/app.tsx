import { UserButton, useUser } from "@clerk/chrome-extension"
import LogoLight from "data-base64:../assets/long_logo_black.png"
import LogoDark from "data-base64:../assets/long_logo_white.png"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

import ThemeToggler from "./components/theme/toggler"
import { Button } from "./components/ui/button"

export default function App() {
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(false);
  const { user, isLoaded } = useUser()
  const storage = new Storage()

  useEffect(() => {
    if (!user) return

    const setEmail = async () => {
      await storage.set("email", user.emailAddresses[0].emailAddress)
    }
    setEmail()
  }, [user])

  useEffect(() => {
    if (!user) return

    const getMeetings = async () => {
      if (!user) return

      setLoading(true)
      const meetings = await fetch(
        `${process.env.PLASMO_PUBLIC_API}/api/meetings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email: user.emailAddresses[0].emailAddress })
        }
      )
      const data = await meetings.json()
      setMeetings(data)
      setLoading(false)
    }
    getMeetings()
  }, [user])

  if (!isLoaded) {
    return (
      <div className="w-full mt-10 p-3 flex justify-center items-center">
        <div className="space-y-2 animate-pulse">
          <div className="h-4 w-1/4 bg-muted rounded"></div>
          <div className="space-y-2">
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoaded && !user) {
    return (
      <div className="w-full mt-10 p-3 flex justify-center items-center">
        <Button className="w-full mt-5" asChild>
          <a
            href={`${process.env.PLASMO_PUBLIC_API}/dashboard`}
            target="_blank">
            Sign into Dashboard
          </a>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full p-2">
      <Header />
      <h1 className="text-xl font-semibold mb-5">Welcome {user.firstName}!</h1>
      {loading && (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 w-1/4 bg-muted rounded"></div>
          <div className="space-y-2">
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
          </div>
        </div>
      )}
      {!loading && meetings.length === 0 && (
        <p className="text-muted-foreground">No recent meetings</p>
      )}
      {!loading && meetings.length > 0 && (
        <div className="space-y-2">
          <h1>Recent meetings</h1>
          {meetings.map((meeting) => {
            return (
              <div
                key={meeting.id}
                className="flex justify-between items-center rounded border p-1">
                <p className="text-sm">{meeting.id}</p>
                <a
                  href={`${process.env.PLASMO_PUBLIC_API}/meetings/${meeting.id}`}
                  target="_blank"
                  className="p-1 rounded bg-foreground text-background">
                  View details
                </a>
              </div>
            )
          })}
        </div>
      )}
      <Button className="w-full mt-5" asChild>
        <a href={`${process.env.PLASMO_PUBLIC_API}/dashboard`} target="_blank">
          View Dashboard
        </a>
      </Button>
    </div>
  )
}

function Header() {
  const { theme } = useTheme()

  return (
    <header className="header flex justify-between items-center">
      {theme === "light" ? (
        <img src={LogoLight} width={130} className="-translate-x-2" />
      ) : (
        <img src={LogoDark} width={130} className="-translate-x-2" />
      )}
      <div className="flex items-center gap-3">
        <UserButton />
        <ThemeToggler />
      </div>
    </header>
  )
}
