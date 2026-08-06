import { GoogleGenAI } from '@google/genai';

// Cloudflare uses 'onRequestPost' to specifically handle POST requests
export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { prompt } = body;

        // Initialize the AI client securely using Cloudflare's 'env' object
        const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

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
}
