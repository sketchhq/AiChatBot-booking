const { Client } = require('pg');
const OpenAI = require('openai');
require('dotenv').config();

async function testVetTool() {
  console.log('--- Direct Simulation Test ---');

  // 1. Database Connection
  const client = new Client({
    host: process.env.DB_HOST_DEV,
    port: process.env.DB_PORT_DEV,
    user: process.env.DB_USER_DEV,
    password: process.env.DB_PASSWORD_DEV,
    database: process.env.DB_NAME_DEV,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database.');

    // 2. Simulate Service Search
    const city = 'Chennai';
    const area = 'Adyar';
    console.log(`Searching for vets in ${area}, ${city}...`);

    const query = `
      SELECT hospital_name, area, city 
      FROM veterinary_hospitals 
      WHERE city ILIKE $1 AND area ILIKE $2 AND is_active = true
      ORDER BY rating DESC LIMIT 5
    `;
    const res = await client.query(query, [`%${city}%`, `%${area}%`]);
    
    console.log(`Found ${res.rows.length} vets.`);
    res.rows.forEach(r => console.log(` - ${r.hospital_name} (${r.area})`));

    // 3. Simulate OpenAI Tool Call Logic
    if (process.env.OPENAI_API_KEY) {
      console.log('Testing OpenAI Tool Trigger...');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a vet assistant. Use search_vets if requested." },
          { role: "user", content: "find a vet in Adyar, Chennai" }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "search_vets",
              parameters: {
                type: "object",
                properties: {
                  city: { type: "string" },
                  area: { type: "string" }
                },
                required: ["city"]
              }
            }
          }
        ]
      });

      const toolCall = completion.choices[0].message.tool_calls?.[0];
      if (toolCall && toolCall.function.name === 'search_vets') {
        const args = JSON.parse(toolCall.function.arguments);
        console.log('✅ OpenAI triggered search_vets with args:', args);
      } else {
        console.log('⚠️ OpenAI did not trigger tool call as expected.');
      }
    }

    console.log('--- Test Complete ---');
  } catch (err) {
    console.error('❌ ERROR:', err);
  } finally {
    await client.end();
  }
}

testVetTool();
