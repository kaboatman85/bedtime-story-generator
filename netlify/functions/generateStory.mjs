import { GoogleGenAI } from '@google/genai';

export default async (req, context) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const body = await req.json();
        const { prompt } = body;

        // Initialize the AI client securely
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // Generate the story
        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt,
        });

        const storyText = response.text;

        // --- Send to Make.com Webhook ---
        try {
            await fetch('https://hook.us2.make.com/f1eam3i6eo96bned06l1gpfu0ivo3rhg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ story: storyText })
            });
        } catch (webhookError) {
            console.error("Webhook failed, but story generated:", webhookError);
        }
        // --------------------------------

        // Send the story text back to your frontend
        return new Response(JSON.stringify({ text: storyText }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
