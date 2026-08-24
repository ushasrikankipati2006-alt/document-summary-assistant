import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import * as pdfjsLib from 'pdfjs-dist'
import { createWorker } from 'tesseract.js'
import './App.css'

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [summary, setSummary] = useState('')
  const [summaryLength, setSummaryLength] = useState('medium')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = (file) => {
    if (!file) return

    const allowedTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg'
    ]

    if (!allowedTypes.includes(file.type)) {
      setSelectedFile(null)
      setSummary('Please upload a PDF, JPG, JPEG, or PNG file.')
      return
    }

    setSelectedFile(file)
    setSummary('')
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    handleFile(file)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files[0]
    handleFile(file)
  }

  const extractPdfText = async (file) => {
    const arrayBuffer = await file.arrayBuffer()

    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer
    }).promise

    let extractedText = ''

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber)
      const textContent = await page.getTextContent()

      const pageText = textContent.items
        .map((item) => item.str)
        .join(' ')

      extractedText += pageText + '\n'
    }

    return extractedText
  }

  const extractImageText = async (file) => {
    const worker = await createWorker('eng')

    const result = await worker.recognize(file)

    await worker.terminate()

    return result.data.text
  }

  const handleGenerateSummary = async () => {
    if (!selectedFile) {
      setSummary('Please choose a document first.')
      return
    }

    setIsProcessing(true)

    try {
      let extractedText = ''

      if (selectedFile.type === 'application/pdf') {
        setSummary('📖 Reading your PDF...')
        extractedText = await extractPdfText(selectedFile)
      } else {
        setSummary('🔍 Reading text from your image...')
        extractedText = await extractImageText(selectedFile)
      }

      if (!extractedText.trim()) {
        throw new Error(
          'No readable text was found in this document.'
        )
      }

      setSummary('🧠 Generating your summary...')

      const response = await fetch('http://localhost:5000/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: extractedText,
          length: summaryLength
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to generate summary.'
        )
      }

      setSummary(data.summary)

    } catch (error) {
      console.error(error)

      setSummary(
        error.message ||
        'Something went wrong while generating the summary.'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="app">
      <div className="container">

        <div className="header">
          <h1>Build Summary Assistant</h1>

          <p>
            Upload a PDF or image and get a simple,
            easy-to-understand summary.
          </p>
        </div>

        <div className="card">
          <h2>📄 Upload Your Document</h2>

          <div
            className={`upload-box ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="upload-icon">
              📄
            </div>

            <p>
              <strong>
                Drag & drop your document here
              </strong>
            </p>

            <p>
              or choose a file from your computer
            </p>

            <input
              className="file-input"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
            />

            <p className="file-types">
              Supported: PDF, PNG, JPG, JPEG
            </p>

            {selectedFile && (
              <div className="selected-file">
                📎 <strong>{selectedFile.name}</strong>
              </div>
            )}
          </div>

          <div className="summary-length">
            <h3>📏 Summary Length</h3>

            <div className="length-options">
              <label>
                <input
                  type="radio"
                  name="summaryLength"
                  value="short"
                  checked={summaryLength === 'short'}
                  onChange={(event) =>
                    setSummaryLength(event.target.value)
                  }
                />
                Short
              </label>

              <label>
                <input
                  type="radio"
                  name="summaryLength"
                  value="medium"
                  checked={summaryLength === 'medium'}
                  onChange={(event) =>
                    setSummaryLength(event.target.value)
                  }
                />
                Medium
              </label>

              <label>
                <input
                  type="radio"
                  name="summaryLength"
                  value="long"
                  checked={summaryLength === 'long'}
                  onChange={(event) =>
                    setSummaryLength(event.target.value)
                  }
                />
                Long
              </label>
            </div>
          </div>

          <button
            className="button"
            onClick={handleGenerateSummary}
            disabled={isProcessing}
          >
            {isProcessing
              ? 'Processing...'
              : 'Generate Summary'}
          </button>
        </div>

        <div className="card">
          <h2>📝 Summary</h2>

          <div className="summary">
            {summary ? (
              <ReactMarkdown>
                {summary}
              </ReactMarkdown>
            ) : (
              <p className="placeholder">
                Your summary will appear here.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default App