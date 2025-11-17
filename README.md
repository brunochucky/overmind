# Overmind - AI Meeting Transcriber

AI meeting transcriber with Groq, Next.js, and React

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Integration](#api-integration)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

Overmind is an intelligent meeting transcription application that leverages AI to convert meeting audio into accurate transcripts. Built with modern technologies, it provides real-time transcription capabilities with support for multiple languages and speaker identification.

## Features

- 🎙️ **Real-time Audio Transcription** - Convert meeting audio to text instantly
- 🤖 **AI-Powered Analysis** - Utilizes Groq API for fast transcription, recap generation, and highlight extraction
- 🌐 **Web-Based Interface** - Built with Next.js and React for seamless user experience
- 📝 **Transcript Management** - Record, save, and organize meeting transcripts
- 🔐 **Authentication** - Secure login and user management
- ✨ **AI-Generated Insights** - Automatic recap and key highlights extraction
- 💾 **Cloud Storage** - AWS S3 integration for audio file storage
- 📱 **PWA Support** - Install as a mobile app

## Tech Stack

### Frontend

- **React** - UI component library
- **Next.js** - React framework with SSR/SSG
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework (optional)

### Backend

- **Next.js API Routes** - Serverless backend
- **Groq API** - AI-powered transcription

### Tools & Libraries

- **Node.js** - Runtime environment
- **npm/yarn** - Package management

## Prerequisites

Before you begin, ensure you have installed:

- Node.js (v16 or higher)
- npm or yarn package manager
- A Groq API key (sign up at [groq.com](https://groq.com))
- Git

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/overmind.git
   cd overmind
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory.

4. **Setup database**

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

## Configuration
### Environment Variables

Create a `.env` file in the root directory with the following variables:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | Prisma database connection string | Yes | `mysql://root:@localhost:3306/overminddb` |
| `GROQ_API_KEY` | Your Groq API key for data processing | Yes | `gsk_xxxxxxxxxxxxx` |
| `DEEPGRAM_API_KEY` | Your Deepgram API key for audio transcription | Yes | `4cbxxxxxxxxxxxxx` |
| `AWS_ACCESS_KEY_ID` | AWS access key for S3 storage | Yes | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key for S3 | Yes | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_REGION` | AWS region | Yes | `us-west-2` |
| `AWS_BUCKET_NAME` | S3 bucket name for audio files | Yes | `apps-xxxxxx` |
| `AWS_PROFILE` | AWS profile name for credentials | No | `hosted_storage` |
| `AWS_FOLDER_PREFIX` | AWS output folder prefix | Yes | `output_audio_folder/` |
| `JWT_SECRET` | Secret used to sign JWTs / session tokens (32+ bytes recommended) | Yes | `overmind-jwt-secret-key...` |


### Example `.env`

```bash
# Database
DATABASE_URL=mysql://root:@localhost:3306/overminddb

# API Keys
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
DEEPGRAM_API_KEY=4cbxxxxxxxxxxxxx

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-west-2
AWS_BUCKET_NAME=apps-xxxxxx
AWS_PROFILE=hosted_storage
AWS_FOLDER_PREFIX=output_audio_folder/

# Authentication
JWT_SECRET=overmind-jwt-secret-key
```

### How to Get Your API Keys

**Groq API Key:**
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Generate API key from dashboard
4. Copy and paste into `.env`

**Deepgram API Key:**
1. Visit [console.deepgram.com](https://console.deepgram.com)
2. Sign up or log in
3. Create a new API key in settings
4. Copy and paste into `.env`

**AWS Credentials:**
1. Log in to [AWS Console](https://console.aws.amazon.com)
2. Navigate to IAM → Users → Create user
3. Attach `AmazonS3FullAccess` policy
4. Create access key and copy `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
5. Set `AWS_REGION` and `AWS_BUCKET_NAME` for your S3 bucket


## Usage

### Development

1. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. **Open browser**

   Navigate to `http://localhost:3000`

3. **Login Credentials**

- Username `hello@ruptureculture.com`
- Password `teste123`

### Building for Production

```bash
npm run build
npm run start
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

This project follows ESLint and Prettier conventions. Format code before committing:

```bash
npm run lint
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy with one click

### Other Platforms

Instructions for deploying to other platforms (Netlify, AWS, etc.) can be found in the documentation.

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the GNU GENERAL PUBLIC LICENSE - see LICENSE file for details.

---

**Last Updated:** November 17, 2025
