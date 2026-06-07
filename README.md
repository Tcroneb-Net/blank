# PuruBoy API

Free and open REST API platform built with **Next.js**. A comprehensive collection of useful APIs for developers, featuring AI tools, downloaders, anime streaming, and more.

Includes interactive API documentation (Swagger-like) and a clean, modern playground.

## 🚀 Key Features

### 🤖 Artificial Intelligence (AI)
- **Text to Image**: Vheer, Flux, Ghibli Style, Brat Generator
- **ChatBot**: Grok-4, GPT-4 (Typli), Custom Agents (Llama, DeepSeek)
- **Vision**: Image analysis using Gemini (ScreenApp)
- **Text to Speech (TTS)**: Svara, Aitwo
- **Text Processing**: Translapp (Translate, Paraphrase, Summarize)

### 📥 Downloader
- **YouTube**: Download Video/Audio
- **TikTok**: Download No Watermark
- **Instagram**: Video, Reels, Photos
- **Facebook**: Video SD/HD
- **SoundCloud**: Download MP3

### 🎬 Anime & Entertainment
- **Oploverz**: Search, Detail, Stream, Download
- **MyAnimeList**: Search, Popular, Ongoing, Genre
- **SoundCloud Search**: Search & Play music

### 🛠️ Tools
- **Image Editing**: Remove Background, Upscale (Quality Enhancement), Colorize (Old Photo Coloring)
- **System**: Fast Update via AI, Blog System

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via `pg`)
- **Documentation**: Auto-generated from JSDoc Controllers
- **HTTP Client**: Axios & Fetch

## ⚙️ Requirements

Before you start, ensure you have installed:
- [Node.js](https://nodejs.org/) (Version 18 or latest recommended)
- [Git](https://git-scm.com/)
- PostgreSQL Database (You can use free services like Neon.tech or Supabase)

## 📦 Installation & Setup

Follow these steps to run the project on your computer:

1. **Clone Repository**
   ```bash
   git clone https://github.com/Tcroneb-Net/blank.git
   cd blank
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root project folder and fill it with the following configuration:

   ```env
   # PostgreSQL Database Connection
   PURUBOY_PG_URL="postgres://user:password@host:port/database?sslmode=require"

   # Admin Password (for Blog Posting & Delete)
   PURUBOY_ADMIN_KEY="your_secret_password"
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

   Open your browser and visit [http://localhost:3000](http://localhost:3000).

## 📂 Project Structure

Here is the main folder structure:

- **`app/`**: Frontend pages and API Routes (Next.js App Router)
  - `app/api/`: API endpoints (Route Handlers)
- **`components/`**: React UI Components (Card, Navbar, etc)
- **`lib/`**: Business logic and helpers
  - `lib/controllers/`: Core logic for each endpoint (documentation source)
  - `lib/xxx.js`: Helper functions (scrapers, external API wrappers)
- **`public/`**: Static assets (images, favicon)

## 🚀 Deployment

The easiest way to deploy is using **Vercel**:

1. Push your code to GitHub/GitLab
2. Go to [Vercel](https://vercel.com) and "Import Project"
3. Add Environment Variables (`PURUBOY_PG_URL`, `PURUBOY_ADMIN_KEY`) in Vercel settings
4. Deploy!

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for complete guidelines on how to add features or fix bugs.

## 📝 License

This project is open-source. Feel free to use it for learning or further development.

---
**Author**: PuruBoy
