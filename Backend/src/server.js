import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const port = 8000; 
app.use(cors()); 
app.use(express.json()); 


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });



app.post('/api/generateSummary', async (req, res) => {
  try {
   
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }


    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ summary: text });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to generate summary.' });
  }
});


app.listen(port, () => {
  console.log(`✅ Server is running securely on http://localhost:${port}`);
});
