> Lihat versi Bahasa Indonesia: [README_id.md](README_id.md)

# 🏛️ Landmark Lens

A simple modern web application to detect landmarks from images and automatically generate narrated audio guides using **Google Gemini AI**.

## ✨ Key Featuress

- **AI Detection:** Identifies the name and context of landmarks from uploaded photos.tos.
- **Audio Generation:** Converts text descriptions into natural-sounding audio (TTS).
- **Modern UI:** Linear-style design with Tailwind CSS, glassmorphism effects, and Markdown support.
- **Drag-and-Drop:** Interactive scanner component for easy image input.

## 🛠️ Tech Stack

- **Core:** Next.js 16, TypeScript, React
- **Styling:** Tailwind CSS, Lucide Icons
- **AI & Logic:** Google Gemini API (Multimodal), Web Audio API

## 🚀 How to Run

1.  **Clone & Install**

    ```sh
    git clone https://github.com/seinzzz/landmark-lens.git
    cd landmark-lens
    pnpm install # or use npm/yarn
    ```

2.  **Setup Environment**
    Create a `.env.local` file and add your API key:key:

    ```env
    GOOGLE_API_KEY=your_gemini_api_key
    ```

3.  **Run Development Server**

    ```sh
    pnpm run dev
    ```

    Open `http://localhost:3000` in your browser.wser.

---

Built with Next.js & Gemini AI.
© 2025 landmark-lens
