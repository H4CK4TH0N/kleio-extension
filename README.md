# Kleio Extension

Browser extension for Kleio.

## Local Development

1. Clone the repository

    ```bash
    git clone
    ```

2. Install dependencies

    ```bash
    pnpm install
    ```

3. Add environment variables

    `.env.development` file

    ```bash
    PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY=
    CLERK_FRONTEND_API=
    ```

    `.env.chrome` file

    ```bash
    CRX_PUBLIC_KEY=
    ```

4. Run the development server

    ```bash
    pnpm dev
    ```

5. Load the extension in your browser. Load `build/chrome-mv3-dev` folder in your browser.

## Build

1. Build the extension

    ```bash
    pnpm build
    ```

2. Load the extension in your browser. Load `build/chrome-mv3` folder in your browser.
