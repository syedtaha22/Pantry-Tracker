import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { items } = await request.json();

    if (!items || !Array.isArray(items)) {
      return new Response(JSON.stringify({ error: 'Invalid items array' }), { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // or 'gpt-4'
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: `Please suggest a short recipe using these items: ${items.join(', ')}. Be concise and provide only the essential details, including a list of ingredients and brief instructions. The Response should contain two parts. Recipe and Instructions. Write in markdown` }
      ],
      max_tokens: 200,
    });

    const recipe = response.choices[0].message.content.trim();
    return new Response(JSON.stringify({ recipe }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Error generating recipe' }), { status: 500 });
  }
}
