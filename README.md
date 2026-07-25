# codify-Cpp: Image to Code Converter 📸➡️💻

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This project is a mobile application built with **React Native and Expo** that allows users to convert handwritten code from an image into an executable file format. It leverages advanced OCR (Optical Character Recognition) and AI models to accurately interpret and translate the image content into various programming languages.

## Table of Contents 📋

* [Features](#features-star)
* [Tech Stack](#tech-stack-gear)
* [OCR Implementation](#installation-wrench)
* [Installation](#installation-wrench)
* [Usage](#usage-play-button)
* [Project Structure](#project-structure-file-folder)
* [Contributing](#contributing-handshake)
* [License](#license-lock)
* [Important Links](#important-links-link)
* [Footer](#footer-mailbox)

## Features ⭐

* **Image to Code Conversion:** Upload an image containing handwritten code and convert it into a text-based code representation. 🖼️➡️✍️
* **Multiple Language Support:** Supports conversion to various programming languages, including C, C++, C#, Java, JavaScript, and PHP. ⚡
* **Advanced OCR Engines:** Utilizes multiple OCR engines (Vision AI, Tesseract, PaddleOCR, EasyOCR, TrOCR) to provide flexibility and accuracy. 🧐
* **AI Model Integration:** Integrates with AI models like Groq, Gemini, GPT-4o, and Eboo for enhanced code analysis and potential syntax error correction. 🤖
* **Platform Compatibility:** Built with Expo, ensuring a single codebase for iOS and Android. 📱
* **Downloadable Code:** Allows users to download the generated code as a file. 💾
* **User-Friendly Interface:** Clean and intuitive UI designed for ease of use. ✨

## Tech Stack ⚙️

* **Languages:** TypeScript, JavaScript, JSON, Markdown
* **Frameworks/Libraries:** React, React Native, Expo, Expo Router, React Navigation, Reanimated, Jest, ESLint
* **Development Tools:** Node.js, npm/yarn, Expo CLI

## OCR Implementation 🔧
# C++ OCR Backend — Setup & Deployment Guide

## Project Structure
```
backend/
├── main.py           # FastAPI app (endpoints)
├── ocr_engine.py     # TrOCR image-to-text
├── postprocessor.py  # Regex + AI code cleanup
├── requirements.txt
├── output_files/     # auto-created, stores .cpp files
└── README.md
```

---

## Option A — Run Locally (for development/testing)

### 1. Install Python 3.10+
Download from https://python.org

### 2. Create a virtual environment
```bash
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

> ⚠️ First run downloads the TrOCR model (~1.5 GB). This is cached after the first download.

### 4. (Optional) Set AI API key for syntax checking
```bash
# Linux/Mac
export GROQ_API_KEY=your_key_here      # free at console.groq.com
# or
export OPENAI_API_KEY=your_key_here

# Windows
set GROQ_API_KEY=your_key_here
```

### 5. Run the server
```bash
python main.py
```

Server starts at `http://0.0.0.0:8000`

### 6. Find your local IP for the phone
```bash
# Linux/Mac
ifconfig | grep inet

# Windows
ipconfig
```
Look for something like `192.168.x.x` or `10.x.x.x`.  
Update `API_URL` in `upload.tsx` to `http://YOUR_IP:8000`.

---

## Option B — Deploy to a VPS (Recommended for Production)

### Recommended providers (cheap/free tiers):
| Provider        | Free Tier | Link |
|----------------|-----------|------|
| Railway         | ✅ Free    | railway.app |
| Render          | ✅ Free    | render.com |
| DigitalOcean    | $6/mo      | digitalocean.com |
| Hetzner         | €4/mo      | hetzner.com |

### Steps for Railway (Easiest):

1. Go to https://railway.app and sign up with GitHub
2. Click **New Project → Deploy from GitHub Repo**
3. Push your backend folder to a GitHub repo
4. Add a `Procfile` in the backend folder:
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
5. In Railway dashboard → Variables, add:
   ```
   GROQ_API_KEY=your_key_here
   ```
6. Railway gives you a public URL like `https://your-app.railway.app`
7. Update `API_URL` in `upload.tsx` to this URL

---

## Option C — Deploy with Docker (Any VPS)

### Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Build and run:
```bash
docker build -t cpp-ocr-backend .
docker run -p 8000:8000 -e GROQ_API_KEY=your_key cpp-ocr-backend
```

---

## Option D — Deploy on a University/Lab Server (Linux)

If you have SSH access to a server:

```bash
# Connect
ssh user@server_ip

# Install Python if needed
sudo apt update && sudo apt install python3-pip python3-venv -y

# Upload your files
scp -r ./backend user@server_ip:~/backend

# On the server
cd ~/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run in background (stays alive after SSH disconnect)
nohup python main.py > server.log 2>&1 &

# Or with screen
screen -S ocr
python main.py
# Press Ctrl+A then D to detach
```

---

## AI Syntax Fix Setup (Free Option: Groq)

1. Go to https://console.groq.com
2. Sign up for free
3. Create an API key
4. Set it as environment variable `GROQ_API_KEY`

Groq is free, fast (uses Llama 3.3 70B), and needs no credit card for basic use.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| POST | `/ocr` | Upload image → returns JSON with `raw`, `formatted`, `download_url` |
| GET | `/download/{filename}` | Download the `.cpp` file |

### Example response from `/ocr`:
```json
{
  "raw": "#include <iostream>\nint main () {...",
  "formatted": "#include <iostream>\n\nint main() {\n    ...\n    return 0;\n}\n",
  "download_url": "/download/abc123.cpp",
  "filename": "abc123.cpp"
}
```

## Installation 🔧

To set up and run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/AbolfazlMoaveni/codify-Cpp.git
    cd codify-Cpp
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root of the project and add the following, replacing the placeholder with your actual backend URL:
    ```
    EXPO_PUBLIC_API_URL=https://your-backend.example.com
    ```
    *(Refer to `.env.example` for details.)*

4.  **Start the development server:**
    ```bash
    npx expo start
    ```

This will start the Expo development server, and you can then run the application on an emulator or a physical device using the Expo Go app or a development build.

## Usage 🕹️

This application is designed to convert handwritten code from images into structured code files.

1.  **Navigate to the Upload Tab:** Open the app and go to the 'آپلود' (Upload) tab.
2.  **Select Image:** Tap on 'انتخاب تصویر از گالری' (Select Image from Gallery) to choose an image containing handwritten code from your device.
3.  **Configure Options (Optional):**
    *   **Language:** Select the desired programming language for the output (e.g., C++, Java, JavaScript).
    *   **OCR Engine:** Choose the OCR engine that best suits your needs. 'Vision AI' is the default and utilizes advanced AI models.
    *   **AI Model:** If using 'Vision AI', you can select a specific AI model for processing.
4.  **Process Image:** The app will automatically upload the image to the backend service for processing.
5.  **View and Download Code:** Once processed, the extracted code will be displayed. You can then download the code as a file (e.g., `.cpp`, `.js`).

### Example Scenario:

Imagine you have a picture of a C++ algorithm you jotted down. You can upload this image, select 'C++' as the language, and the app will process it, returning the C++ code, ready for compilation or further editing.

## Project Structure 📂

The project follows a standard Expo/React Native structure:

```
codify-Cpp/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx       # Home Screen
│   │   └── upload.tsx      # Upload Screen
│   ├── _layout.tsx         # Root layout for navigation
│   └── modal.tsx           # Modal screen
├── assets/
│   └── fonts/              # Custom fonts (e.g., Vazir.ttf)
├── components/
│   ├── ui/
│   │   ├── collapsible.tsx
│   │   └── icon-symbol.tsx
│   ├── external-link.tsx
│   ├── haptic-tab.tsx
│   ├── parallax-scroll-view.tsx
│   └── themed-text.tsx
│   └── themed-view.tsx
├── constants/
│   └── theme.ts            # Color and font constants
├── hooks/
│   ├── use-color-scheme.ts
│   └── use-theme-color.ts
├── scripts/
│   └── reset-project.js    # Script to reset project files
├── .env.example            # Example environment variables
├── .eslintrc.js            # ESLint configuration
├── babel.config.js       # Babel configuration
├── app.json                # Expo app configuration
├── jest.config.js          # Jest testing configuration
├── package.json            # Project dependencies and scripts
├── README.md               # Project README
└── tsconfig.json           # TypeScript configuration
```

## Contributing 🤝

Contributions are welcome! Please follow these guidelines:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

Please ensure your code adheres to the project's coding style and includes tests where applicable.

## License 🔒

This project is licensed under the **MIT License**.

## Important Links 🔗

*   **Repository:** [https://github.com/AbolfazlMoaveni/codify-Cpp](https://github.com/AbolfazlMoaveni/codify-Cpp)
*   **Expo Documentation:** [https://docs.expo.dev/](https://docs.expo.dev/)

## Footer 📬

This project was developed by Abolfazl Moaveni.

--- 

<p align="center">
  Made with ❤️ by <a href="https://github.com/AbolfazlMoaveni">Abolfazl Moaveni</a>
</p>
<p align="center">
  <a href="https://github.com/AbolfazlMoaveni/codify-Cpp/fork">
    <img src="https://img.shields.io/github/forks/AbolfazlMoaveni/codify-Cpp?style=social" alt="GitHub forks">
  </a>
  <a href="https://github.com/AbolfazlMoaveni/codify-Cpp/stargazers">
    <img src="https://img.shields.io/github/stars/AbolfazlMoaveni/codify-Cpp?style=social" alt="GitHub stars">
  </a>
  <a href="https://github.com/AbolfazlMoaveni/codify-Cpp/issues">
    <img src="https://img.shields.io/github/issues/AbolfazlMoaveni/codify-Cpp?style=social" alt="GitHub issues">
  </a>
</p>


---
**<p align="center">Generated by [ReadmeCodeGen](https://www.readmecodegen.com/)</p>**
