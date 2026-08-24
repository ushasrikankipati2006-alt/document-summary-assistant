# Build Summary Assistant

A simple web application that accepts PDF and image documents and generates clear, AI-powered summaries.

## Features

- Upload PDF documents
- Upload PNG, JPG, and JPEG images
- Drag-and-drop file upload
- Extract text from PDFs using PDF.js
- Extract text from images using Tesseract.js OCR
- Generate AI-powered summaries using Google Gemini
- Choose summary length:
  - Short
  - Medium
  - Long
- Highlight important points and main ideas
- Markdown-formatted summaries
- Loading and error states
- Responsive interface for desktop and mobile devices

## Tech Stack

### Frontend
- React
- Vite
- PDF.js
- Tesseract.js
- React Markdown
- CSS

### Backend
- Node.js
- Express.js
- Google Gemini API
- dotenv
- CORS

## How It Works

1. The user uploads a PDF or image.
2. PDF files are processed using PDF.js to extract their text.
3. Image files are processed using Tesseract.js OCR.
4. The extracted text is sent to the backend.
5. The backend sends the text to Google Gemini with the selected summary length.
6. Gemini generates a clear summary containing the main ideas and important points.
7. The summary is displayed in the application using Markdown formatting.

## Project Structure

```text
document-summary-assistant/
├── public/
├── server/
│   └── server.js
├── src/
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── .gitignore
├── package.json
├── package-lock.json
├── index.html
└── vite.config.js