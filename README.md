# Overmind - AI Meeting Transcriber

An intelligent meeting transcription application that leverages AI to convert meeting audio into accurate transcripts with summaries and key highlights.

## Overview

Overmind is a full-stack web application built with Next.js that provides an end-to-end solution for recording, transcribing, and analyzing meetings. It uses Deepgram for audio-to-text transcription and another AI service (likely via an API call in the backend, not specified in dependencies) to generate summaries and highlights. The application supports user authentication, cloud storage for audio files, and a responsive interface for managing meetings.

It is designed to be a Progressive Web App (PWA), allowing for installation on mobile and desktop devices.

## Features

- 🎙️ **Real-time Audio Recording**: Capture meeting audio directly in the browser.
- 🧠 **AI-Powered Transcription**: Utilizes Deepgram for fast and accurate audio-to-text conversion.
- ✨ **AI-Generated Insights**: Automatically generates a concise summary (recap) and extracts key highlights from the transcript.
- 💾 **Cloud Storage**: Securely uploads and stores audio recordings in an AWS S3 bucket.
- 📝 **Meeting Management**: A dashboard to create, view, and manage all your meetings and their transcripts.
- 🔐 **User Authentication**: Secure access with a dedicated login system for users.
- ⚙️ **Customizable AI Context**: Ability to set a global context to tailor AI-generated highlights to specific needs (e.g., focusing on user interviews, technical discussions).
- 📱 **PWA Support**: Can be installed on desktop or mobile for an app-like experience.

## Tech Stack

### Core Frameworks
- **Next.js 14**: React framework for full-stack web development (using the App Router).
- **React 18**: Library for building user interfaces.
- **TypeScript**: For static type-checking.

### Backend
- **Next.js API Routes**: For serverless backend logic.
- **Prisma**: Next-generation ORM for database access (MySQL).
- **NextAuth.js**: Authentication solution.
- **Deepgram**: For AI-powered speech-to-text transcription.
- **Groq**: For AI-powered summary and highlight generation.
- **AWS S3**: For cloud object storage.

### Frontend
- **Tailwind CSS**: Utility-first CSS framework.
- **shadcn/ui**: Re-usable components built with Radix UI and Tailwind CSS.
- **React Hook Form & Zod**: For building and validating forms.
- **Zustand / Jotai**: State management libraries.
- **TanStack Query (React Query) / SWR**: For data fetching and caching.
- **Lucide React**: Icon library.
- **Sonner**: For displaying toasts/notifications.

### Development
- **ESLint**: For code linting.
- **tsx**: For running TypeScript scripts (like database seeding).

## Project Structure

The project uses the Next.js App Router structure.

```
overmind/
├── app/
│   ├── api/
│   │   ├── auth/         # NextAuth.js authentication routes
│   │   ├── meetings/     # API routes for managing meetings (CRUD)
│   │   ├── settings/     # API routes for app settings
│   │   └── transcribe/   # API for handling transcription process
│   ├── dashboard/      # Protected dashboard pages
│   ├── login/          # Login page UI
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Landing/main page
├── components/
│   ├── ui/             # Reusable UI components from shadcn/ui
│   ├── *.tsx           # Application-specific React components
├── hooks/              # Custom React hooks
├── lib/                # Shared libraries, utilities, and configurations (auth, db, s3)
├── prisma/
│   └── schema.prisma   # Prisma schema defining the database models
├── public/             # Static assets (images, manifest.json)
├── scripts/
│   └── seed.ts         # Database seeding script
├── .env                # Environment variables (needs to be created)
├── next.config.js      # Next.js configuration
├── tailwind.config.ts  # Tailwind CSS configuration
└── package.json
```

## Database Schema

The database contains three main models defined in `prisma/schema.prisma`:

- **User**: Stores user credentials for authentication (`id`, `email`, `password`, `name`).
- **Meeting**: The core model tracking each meeting's data (`id`, `name`, `email`, `language`, `transcript`, `duration`, `audioPath`, `recap`, `highlights`, `status`).
- **AppSettings**: A singleton table for global settings, such as the context for AI highlight generation.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- Yarn or npm
- A MySQL database
- Git
- AWS CLI configured with a credentials profile.

You will also need API keys and credentials for:
- Deepgram
- Groq
- Amazon Web Services (AWS)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd overmind
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**

    Create a `.env` file in the root of the project. Copy the block below and replace the placeholder values with your actual credentials.

    ```bash
    # .env

    # --- Database ---
    # Your MySQL connection string
    DATABASE_URL='mysql://root:@localhost:3306/overminddb'

    # --- API Keys ---
    DEEPGRAM_API_KEY="YOUR_DEEPGRAM_API_KEY"
    GROQ_API_KEY="YOUR_GROQ_API_KEY"

    # --- Authentication ---
    # Secret key for signing JWTs with NextAuth.js
    JWT_SECRET="overmind-jwt-secret"

    # --- AWS S3 Configuration ---
    # This setup uses a named profile from your AWS credentials file.
    AWS_PROFILE="hosted_storage"
    AWS_REGION="us-west-2"
    AWS_BUCKET_NAME="YOUR_AWS_BUCKET_NAME"
    AWS_FOLDER_PREFIX="11258/"
    ```

4.  **Apply database migrations:**

    This will create the tables in your database based on the Prisma schema.
    ```bash
    npx prisma db push
    ```

5.  **(Optional) Seed the database:**

    The project contains a seed script. You can run it to populate initial data.
    ```bash
    npx prisma db seed
    ```

### Running the Application

1.  **Start the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

2.  **Open your browser:**
    Navigate to [http://localhost:3000](http://localhost:3000) to see the application running.

### Available Scripts

-   `dev`: Starts the development server.
-   `build`: Creates a production-ready build of the application.
-   `start`: Starts the production server.
-   `lint`: Runs the ESLint code analyzer.
