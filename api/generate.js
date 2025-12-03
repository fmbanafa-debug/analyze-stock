// This file runs on Vercel's server.
// It securely uses the API key you set in Vercel Environment Variables.

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    // 1. Check if the API key exists in Vercel Settings
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Configuration Error: GEMINI_API_KEY is missing in Vercel.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parse the request from the frontend
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method Not Allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const payload = await req.json();

    // 3. Forward the request securely to Google Gemini
    const googleResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    // 4. Handle Google's response
    const data = await googleResponse.json();

    if (!googleResponse.ok) {
        return new Response(JSON.stringify(data), { 
            status: googleResponse.status, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }

    // 5. Send success back to your website
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Server Error: ${error.message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
