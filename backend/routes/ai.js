const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const auth = require('../middleware/auth');

// Initialize OpenAI client with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// @route   POST /api/ai/analyze
// @desc    Analyze a job description
// @access  Private
router.post('/analyze', auth, async (req, res) => {
  const { jobDescription } = req.body;

  if (!jobDescription) {
    return res.status(400).json({ msg: 'Job description is required' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Or "gpt-4" if you have access
      messages: [
        {
          role: "system",
          content: "You are an expert career assistant. Analyze the following job description and extract the key skills, qualifications, and responsibilities. Return the result as a JSON object with three keys: 'skills', 'qualifications', and 'responsibilities'. Each key should have an array of strings as its value."
        },
        {
          role: "user",
          content: jobDescription
        }
      ],
      // This ensures the model returns valid JSON
      response_format: { type: "json_object" },
    });

    // The response from OpenAI is a string, so we need to parse it into a JSON object
    const analysisResult = JSON.parse(completion.choices[0].message.content);
    
    res.json(analysisResult);

  } catch (error) {
    console.error('Error with OpenAI API:', error);
    res.status(500).send('Error analyzing job description');
  }
});

module.exports = router;