const {GoogleGenAI} = require("@google/genai");
const { conceptExplainPrompt, questionAnswerPrompt} = require("../utils/prompts");
require("dotenv").config();

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

// @desc Generate interview question and answer using Gemini
// @routen POST /api/ai/generate-questions
// @access Private
const generateInterviewQuestions = async (req , res) => {
    try{
        const { role , experience , topicsToFocus , numberOfQuestions} = req.body;

        if(!role || !experience || !topicsToFocus || !numberOfQuestions) {
            return res.status(400).json({message: "Missing required feilds"});
        }

        const prompt = questionAnswerPrompt(role , experience , topicsToFocus , numberOfQuestions);
 
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite",
            contents: prompt,
        });

        let rawText = response.text;

        //Clean it: Remaove ```json and ``` from beginning and end
        const cleanedText = rawText
        .replace(/^```json\s*/,"") // remove starting ```json
        .replace(/```$/,"") // remove ending ```
        .trim(); // remove extra spaces

        //Now safe  to parse
        const data = JSON.parse(cleanedText);

        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({
            message:"Failed to generate questions",
            error:error.message,
        });
    }
};

// @desc Generate explain a interview question
// @routen POST /api/ai/generate-explaination
// @access Private
const generateConceptExplanation = async (req , res) => {
    try{
        const { question} = req.body;

        if(!question) {
            return res.status(400).json({message:"Missing required fields"});
        }

        const prompt = conceptExplainPrompt(question);

        const response = await ai.models.generateContent({
            model:"gemini-2.0-flash-lite",
            contents:prompt,
        })

        let rawText = response.text;

        // Clean it: Remove ```json and ``` from beginning and end
          const cleanedText = rawText
        .replace(/^```json\s*/,"") // remove starting ```json
        .replace(/```$/,"") // remove ending ```
        .trim(); // remove extra spaces

        //Now safe to parse
        const data = JSON.parse(cleanedText);

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({
            message:"Failed to generate questions",
            error:error.message,
        });
    }
};

module.exports = { generateConceptExplanation  , generateInterviewQuestions};
