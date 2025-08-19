// Step 1: Set up a Next.js project
// If you haven't already, run:
// npx create-next-app@latest online-exam-simulator

// Step 2: Install required dependencies
// npm install tesseract.js multer next-connect @mui/material @mui/icons-material

// pages/index.js - Main UI
import { useState } from 'react';
import axios from 'axios';
import { Button, Container, Typography, Input } from '@mui/material';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [text, setText] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select a file first");
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    try {
      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setText(response.data.text);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error processing file. Try again.");
    }
  };

  return (
    <Container style={{ textAlign: 'center', marginTop: '20px' }}>
      <Typography variant="h4">Online Exam Simulator</Typography>
      <Input type="file" onChange={handleFileChange} style={{ margin: '20px 0' }} />
      <Button variant="contained" color="primary" onClick={handleUpload}>Upload & Extract Text</Button>
      <Typography variant="body1" style={{ marginTop: '20px', whiteSpace: 'pre-wrap' }}>{text}</Typography>
    </Container>
  );
}

// pages/api/upload.js - OCR Processing
import nc from 'next-connect';
import multer from 'multer';
import Tesseract from 'tesseract.js';

const upload = multer({ storage: multer.memoryStorage() });

const handler = nc()
  .use(upload.single('file'))
  .post(async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const { buffer } = req.file;
      const result = await Tesseract.recognize(buffer, 'eng');
      res.json({ text: result.data.text });
    } catch (error) {
      console.error("OCR processing error:", error);
      res.status(500).json({ error: 'Error processing file' });
    }
  });

export default handler;
export const config = { api: { bodyParser: false } };
