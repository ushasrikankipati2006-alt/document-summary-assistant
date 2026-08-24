import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
)

app.post('/summarize', async (req, res) => {
  try {
    const { text, length = 'medium' } = req.body

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: 'No document text was provided.'
      })
    }

    let lengthInstruction = ''

    if (length === 'short') {
      lengthInstruction =
        'Create a short summary using approximately 5 to 8 key points. Be concise.'
    } else if (length === 'long') {
      lengthInstruction =
        'Create a detailed summary covering the important ideas, findings, details, and conclusions. Use clear sections and bullet points where useful.'
    } else {
      lengthInstruction =
        'Create a medium-length summary covering the main ideas and important supporting points without unnecessary detail.'
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash'
    })

    const prompt = `
You are a document summarization assistant.

Summarize the following document in a clear, accurate and easy-to-understand way.

${lengthInstruction}

Requirements:
- Identify the main topic and purpose.
- Highlight the most important points and findings.
- Use Markdown headings and bullet points where appropriate.
- Do not invent information that is not present in the document.
- Keep the summary faithful to the original document.

Document:
${text}
`

    const result = await model.generateContent(prompt)

    const response = await result.response

    const summary = response.text()

    res.json({ summary })

  } catch (error) {
    console.error('Summarization error:', error)

    res.status(500).json({
      error: 'Failed to generate the summary.'
    })
  }
})

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000')
})