import { ClerkProvider } from "@clerk/chrome-extension"
import React from "react"

import App from "./app"

import "@/style.css"

import { ThemeProvider } from "./components/theme/provider"

const PUBLISHABLE_KEY = process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

function IndexPopup() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} syncSessionWithTab>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange>
        <div className="w-[350px] h-[500px]">
          <App />
        </div>
      </ThemeProvider>
    </ClerkProvider>
  )
}

export default IndexPopup
