import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';

@Injectable()
export class AIService {

  private groq: Groq;

  constructor() {
    const key = process.env.GROQ_API_KEY;
    console.log('[AIService] Groq Key Diagnostic:', {
      length: key?.length || 0,
      start: key?.substring(0, 15),
      end: key?.substring((key?.length || 0) - 4)
    });

    if (!key) {
      throw new Error('GROQ_API_KEY is required for AIService');
    }

    this.groq = new Groq({ apiKey: key });
  }

  private systemPrompt = `
You are PetCareGPT, a professional AI-powered pet care assistant.

You behave like ChatGPT:
- Friendly and conversational
- Give helpful medical advice for pet issues
- Ask follow-up questions when needed
- Use clean markdown formatting
- DO NOT repeat the user's message

========================
🚨 CRITICAL TOOL USAGE RULES
========================

❌ DEFAULT BEHAVIOR: ANSWER DIRECTLY (NO TOOLS)

For 95% of questions, you should answer directly WITHOUT using any tools.

------------------------

1️⃣ HEALTH & SYMPTOM QUESTIONS (NO TOOLS)

When user mentions ANY health issue, symptom, or medical concern:
- fever, vomiting, diarrhea, injury, infection
- not eating, limping, scratching, coughing
- skin issues, behavior changes, pain
- "my pet is sick"
- "what should I do if..."
- "is it normal when..."

👉 RESPONSE APPROACH:
1. Acknowledge the concern
2. Provide helpful medical information
3. Suggest possible causes
4. Give home care tips
5. Advise when to see a vet
6. DO NOT call any tool
7. DO NOT search for vets unless they explicitly ask for location

------------------------

2️⃣ VET SEARCH TOOL (EXTREMELY STRICT)

✅ ONLY use when user is EXPLICITLY looking for a VET LOCATION:
- "find a vet near me"
- "vet clinics in [city]"
- "where is the nearest animal hospital"
- "show me vets in [area]"
- "I need a vet's address"
- When user provides a city name IN RESPONSE to you asking for location
- When user provides an area name IN RESPONSE to you asking for area

❌ NEVER use for:
- Symptoms or health questions
- General advice ("should I take my dog to the vet?")
- Medical concerns
- ANY question that doesn't explicitly ask for a location/clinic

IMPORTANT - SMART LOCATION FLOW:

📍 Step 1 - If user asks for vets WITHOUT city:
  - Ask: "Which city are you in?"

📍 Step 2 - When user provides city (especially big cities):
  - ALWAYS ask for area: "[City] is a large city. Which area are you looking in?"

📍 Step 3 - When user provides area:
  - Use tool with BOTH city AND area

📍 Step 4 - If no vets in that area:
  - System will suggest alternative areas
  - Wait for user to choose, then use tool again

Example:
{"tool":"vets","city":"Chennai","area":"Adyar"}

------------------------

3️⃣ PRODUCT SEARCH TOOL

✅ ONLY use when user wants to BUY/SHOP:
- "I need dog food"
- "show me toys for cats"
- "what products do you have for..."
- "I want to buy..."

Example:
{"tool":"products","pet_type":"dog"}

❌ NEVER use for health questions or general advice

------------------------

4️⃣ EXAMPLE SCENARIOS

User: "My dog has a fever"
✅ Correct: Provide medical advice directly (no tool)
❌ Wrong: Use vet tool

User: "My cat is vomiting, what should I do?"
✅ Correct: Give advice on causes, home care, when to see vet (no tool)
❌ Wrong: Use vet tool

User: "Is there a vet near me in Mumbai?"
✅ Correct: Use vet tool with city="Mumbai"
❌ Wrong: Give general advice only

User: "My puppy isn't eating well"
✅ Correct: Discuss possible reasons, feeding tips (no tool)
❌ Wrong: Use any tool

========================
`;

  async streamChat(messages: any[]) {

    console.log('[AIService] Calling Groq streamChat...', { model: 'llama-3.1-8b-instant', messageCount: messages.length });
    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        //   stream: true,
        stream: false, // TEMP: Disable streaming for now due to issues
        temperature: 0.7,
        max_tokens: 1000,
        messages: [
          {
            role: 'system',
            content: this.systemPrompt
          },
          ...messages
        ]
      });
      console.log('[AIService] streamChat success');

      const content = response.choices?.[0]?.message?.content || "";

      // 🚫 BLOCK WRONG TOOL TRIGGER (Safety check for missing location)
      if (content.includes('"tool":"vets"') && !content.includes('"city"')) {
        console.log('[AIService] Safety check triggered: Blocking incomplete vet tool call');
        return {
          ...response,
          choices: [{
            ...response.choices[0],
            message: {
              ...response.choices[0].message,
              content: content.replace(/\{[\s\S]*\}/, '') // remove JSON
            }
          }]
        };
      }

      return response;
    } catch (err: any) {
      console.error('[AIService] OpenAI streamChat ERROR:', {
        status: err.status,
        message: err.message,
        type: err.type,
        code: err.code
      });
      throw err;
    }
  }

  async generateTitle(messages: any[]) {

    console.log('[AIService] Calling Groq generateTitle...');
    let response;
    try {
      response = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        temperature: 0.5,
        max_tokens: 20,
        messages: [
          {
            role: 'system',
            content: `
  Generate a VERY SHORT chat title (max 5 words).
  No punctuation.
  Examples:
  Dog vomiting issue
  Cat skin allergy
  Puppy diet guidance
  `
          },
          ...messages
        ]
      });
      console.log('[AIService] generateTitle success');
    } catch (err: any) {
      console.error('[AIService] OpenAI generateTitle ERROR:', {
        status: err.status,
        message: err.message,
        type: err.type,
        code: err.code
      });
      throw err;
    }

    const rawTitle = response.choices?.[0]?.message?.content || 'New Chat';

    return rawTitle
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .split(' ')
      .slice(0, 5)
      .join(' ')
      .trim();
  }

}