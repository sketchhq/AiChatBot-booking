import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from '../messages/entities/messages.entity';
import { Chat } from '../chats/entities/chats.entity';
import { Repository } from 'typeorm';
import { ProductRecommendationsService } from '../product-recommendations/recommendations.service';
import { VeterinaryHospitalsService } from '../veterinary-hospitals/veterinary-hospitals.service';
import { ChatbotFeedback } from '../feedback/entities/feedback.entity';
import OpenAI from "openai";
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

@Injectable()
export class MessagesService {
  private openai: OpenAI;

  constructor(
    @InjectRepository(Message)
    private repo: Repository<Message>,

    @InjectRepository(Chat)
    private chatRepo: Repository<Chat>,

    private productService: ProductRecommendationsService,

    private vetService: VeterinaryHospitalsService,

    @InjectRepository(ChatbotFeedback)
    private feedbackRepo: Repository<ChatbotFeedback>,
  ) {
    const key = process.env.OPENAI_API_KEY;
    console.log('[MessagesService] OpenAI Key Diagnostic:', {
      length: key?.length || 0,
      start: key?.substring(0, 15),
      end: key?.substring((key?.length || 0) - 4)
    });
    this.openai = new OpenAI({ apiKey: key });
  }

  async create(dto: any, userId: string) {
    if (userId.startsWith('guest_')) {
      const ai = await this.smartAI(dto.content, dto.chat_id, dto.history);
      
      const userMsg = {
        id: `msg_user_${Date.now()}`,
        chat_id: dto.chat_id,
        user_id: userId,
        role: 'user',
        content: dto.content,
        created_at: new Date()
      };

      const aiMsg = {
        id: `msg_ai_${Date.now()}`,
        chat_id: dto.chat_id,
        user_id: userId,
        role: 'assistant',
        content: typeof ai === 'string' ? ai : JSON.stringify(ai),
        created_at: new Date()
      };

      return { userMsg, aiMsg };
    }

    // Save user message
    const userMsg = await this.repo.save({
      ...dto,
      user_id: userId,
      role: 'user',
    });

    // Generate AI response
    const ai = await this.smartAI(dto.content, dto.chat_id);

    // Save AI response
    const aiMsg = await this.repo.save({
      chat_id: dto.chat_id,
      user_id: userId,
      role: 'assistant',
      content: typeof ai === 'string' ? ai : JSON.stringify(ai)
    });

    // 🔥 Auto-generate chat title after first message (like ChatGPT)
    const aiText = typeof ai === 'string' ? ai : (ai?.content || '');
    this.autoGenerateTitle(dto.chat_id, dto.content, aiText).catch(err =>
      console.error('[MessagesService] Auto-title generation failed:', err)
    );

    return { userMsg, aiMsg };
  }

  /**
   * Auto-generate a chat title based on the conversation (like ChatGPT).
   * Skips greetings — waits for meaningful content before generating.
   * Only runs if the chat still has the default "New Chat" title.
   */
  private async autoGenerateTitle(chatId: string, userContent: string, aiResponse: string) {
    try {
      const chat = await this.chatRepo.findOne({ where: { id: chatId } });
      if (!chat || chat.title !== 'New Chat') return;

      // Extract text from potentially multimodal content
      let userText = userContent;
      try {
        const parsed = JSON.parse(userContent);
        if (Array.isArray(parsed)) {
          const textPart = parsed.find(p => p.type === 'text');
          const hasImage = parsed.some(p => p.type === 'image_url');
          userText = textPart?.text || (hasImage ? '__IMAGE__' : '');
        }
      } catch (e) {
        // Not JSON, use as-is
      }

      // 🚫 Skip title generation for greetings — wait for real content
      const greetings = ['hi', 'hello', 'hey', 'hii', 'hiii', 'yo', 'sup', 'hola', 'howdy', 
                         'good morning', 'good afternoon', 'good evening', 'good night',
                         'hi there', 'hello there', 'hey there', 'whats up', "what's up",
                         'how are you', 'how r u', 'hru'];
      const normalizedUser = (userText || '').trim().toLowerCase().replace(/[^a-z0-9 ']/g, '');
      if (!userText || normalizedUser.length === 0 || greetings.includes(normalizedUser)) {
        console.log('[MessagesService] Skipping title gen — greeting or empty message');
        return;
      }

      // For image-only uploads with no text, use a generic image title
      if (userText === '__IMAGE__') {
        userText = 'User uploaded a pet image for analysis';
      }

      // Extract text from AI response (may be JSON with products/vets)
      let aiText = aiResponse;
      try {
        const parsed = JSON.parse(aiResponse);
        if (typeof parsed === 'object' && parsed.content) {
          aiText = parsed.content;
        }
      } catch (e) {
        // Not JSON, use as-is
      }

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 15,
        messages: [
          {
            role: 'system',
            content: `You generate very short chat titles (2-5 words) like ChatGPT does.

Rules:
- The title must describe the TOPIC, not the interaction
- Use simple everyday language, not formal language
- Never use words like: inquiry, initial, request, assistance, discussion, conversation, regarding
- Good examples: "Dog scratching a lot", "Cat food options", "Vet near Chennai", "Puppy won't eat", "Golden retriever info"
- Bad examples: "Initial Greeting Inquiry", "Pet Health Assistance Request", "User Query Discussion"
- Just output the title, nothing else`
          },
          {
            role: 'user',
            content: (userText || '').substring(0, 200)
          },
          {
            role: 'assistant',
            content: (aiText || '').substring(0, 300)
          }
        ]
      });

      const rawTitle = response.choices?.[0]?.message?.content || 'New Chat';
      const cleanTitle = rawTitle
        .replace(/^["']|["']$/g, '')  // Remove surrounding quotes
        .replace(/[^\w\s]/g, '')      // Remove special chars but keep spaces
        .split(' ')
        .slice(0, 6)
        .join(' ')
        .trim() || 'New Chat';

      console.log('[MessagesService] Auto-generated title:', cleanTitle);
      chat.title = cleanTitle;
      await this.chatRepo.save(chat);
    } catch (err) {
      console.error('[MessagesService] autoGenerateTitle error:', err);
    }
  }


  /**
   * Parse stored content string into OpenAI-compatible message content.
   * Handles both plain text and JSON-encoded multimodal content (image_url, file).
   */
  private parseContentForOpenAI(content: string): string | any[] {
    if (!content) return content;

    try {
      const trimmed = content.trim();
      if (trimmed.startsWith('[')) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasImage = parsed.some(p => p.type === 'image_url');
          const hasFile = parsed.some(p => p.type === 'file');

          if (hasImage || hasFile) {
            // Build OpenAI multimodal content array
            const parts: any[] = [];

            for (const part of parsed) {
              if (part.type === 'text') {
                parts.push({ type: 'text', text: part.text || '' });
              } else if (part.type === 'image_url') {
                // Normalize image_url format for OpenAI
                const url = typeof part.image_url === 'string'
                  ? part.image_url
                  : part.image_url?.url || part.image_url;
                parts.push({
                  type: 'image_url',
                  image_url: { url }
                });
              } else if (part.type === 'file') {
                // For files, describe them as text since OpenAI can't read arbitrary files
                const fileName = part.file?.name || 'Unknown file';
                const fileUrl = part.file?.data || '';
                parts.push({
                  type: 'text',
                  text: `[Attached file: ${fileName}] URL: ${fileUrl}`
                });
              }
            }

            return parts.length > 0 ? parts : content;
          }
        }
      }
    } catch (e) {
      // Not JSON, return as-is
    }

    return content;
  }

  async smartAI(query: string, chatId: string, frontendHistory?: any[]) {

    let historyMessages: ChatCompletionMessageParam[] = [];

    if (frontendHistory && frontendHistory.length > 0) {
      historyMessages = frontendHistory.map(m => ({
        role: m.role as "user" | "assistant",
        content: this.parseContentForOpenAI(m.content)
      }));
    } else if (chatId && !chatId.startsWith('guest_chat')) {
      /**
       * Load conversation history
       */
      const history = await this.repo.find({
        where: { chat_id: chatId },
        order: { created_at: "ASC" },
        take: 10
      });

      // Parse history messages — handle multimodal content (images, files)
      historyMessages = history.map(m => {
        const parsedContent = this.parseContentForOpenAI(m.content);
        return {
          role: m.role as "user" | "assistant",
          content: parsedContent
        } as ChatCompletionMessageParam;
      });
    }

    // Parse the current user query — it may contain image/file content
    const userContent = this.parseContentForOpenAI(query);
    const hasVision = Array.isArray(userContent) && userContent.some(p => p.type === 'image_url');

    // Use gpt-4o for vision requests, gpt-4o-mini for text-only
    const model = hasVision ? 'gpt-4o' : 'gpt-4o-mini';

    /**
     * Build conversation messages
     */
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `
You are PetCareGPT, a professional AI-powered pet care assistant.

You behave like ChatGPT:
- Friendly and conversational
- Give helpful medical advice for pet issues
- Ask follow-up questions when needed
- Use clean markdown formatting
- DO NOT repeat the user's message
- When a user uploads an image, ANALYZE it carefully and describe what you see
- If the image shows a pet, identify the breed, health concerns, or anything relevant
- If the image shows a product label, food, or document, read and analyze it

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

✅ ONLY call search_vets when user is EXPLICITLY looking for a VET LOCATION:
- "find a vet near me"
- "vet clinics in [city]"
- "where is the nearest animal hospital"
- "show me vets in [area]"
- "I need a vet's address"
- When user provides a city name IN RESPONSE to you asking for location
- When user provides an area name IN RESPONSE to you asking for area

❌ NEVER call search_vets for:
- Symptoms or health questions
- General advice ("should I take my dog to the vet?")
- Medical concerns
- ANY question that doesn't explicitly ask for a location/clinic

IMPORTANT - SMART LOCATION FLOW:

📍 Step 1 - If user asks for vets WITHOUT city:
  - Ask: "Which city are you in?"

📍 Step 2 - When user provides city (especially big cities like Chennai, Mumbai, Bangalore, Delhi):
  - ALWAYS ask for area: "[City] is a large city. Which area are you looking in?"
  - Example: "Chennai is a large city. Which area are you looking in? (e.g., Adyar, T Nagar, Anna Nagar)"

📍 Step 3 - When user provides area:
  - Call search_vets with BOTH city AND area
  - If backend returns type="no_vets_in_area", the system will show alternative areas
  - You should acknowledge this and wait for user to choose

📍 Step 4 - If user confirms alternative area:
  - Call search_vets again with city and the new area they selected

REQUIRED PARAMETERS:
- city (MUST be provided - ask if missing)
- area (STRONGLY RECOMMENDED for large cities - ask if missing)

EXAMPLES OF CORRECT FLOW:

User: "find a vet"
You: "Which city are you in?"
User: "Chennai"
You: "Chennai is a large city. Which area are you looking in? (e.g., Adyar, T Nagar, Anna Nagar)"
User: "Adyar"
You: [Call search_vets with city="Chennai", area="Adyar"]

User: "vets in mumbai"
You: "Which area of Mumbai are you looking in? (e.g., Andheri, Bandra, Powai)"
User: "Bandra"
You: [Call search_vets with city="Mumbai", area="Bandra"]

------------------------

3️⃣ PRODUCT SEARCH TOOL

✅ ONLY call search_products when user wants to BUY/SHOP:
- "I need dog food"
- "show me toys for cats"
- "what products do you have for..."
- "I want to buy..."

⚠️ IMPORTANT - SEARCH STRATEGY:
- Our database does NOT have wet/dry food filters
- When user asks for "cat food", search for "cat food" (not wet/dry specifics)
- When user asks for "dry kibble", search for "cat food" or "dog food"
- Let the product titles/descriptions show what type they are
- DO NOT ask clarifying questions about wet vs dry - just search!

❌ NEVER call for:
- Health questions
- General advice

------------------------

4️⃣ EXAMPLE SCENARIOS

User: "My dog has a fever"
✅ Correct: Provide medical advice directly (no tool)
❌ Wrong: Call search_vets

User: "My cat is vomiting, what should I do?"
✅ Correct: Give advice on causes, home care, when to see vet (no tool)
❌ Wrong: Call search_vets

User: "Is there a vet near me in Mumbai?"
✅ Correct: Call search_vets with city="Mumbai"
❌ Wrong: Give general advice

User: "My puppy isn't eating well"
✅ Correct: Discuss possible reasons, feeding tips (no tool)
❌ Wrong: Call any tool

------------------------
`
      },
      ...historyMessages,
      {
        role: "user",
        content: userContent
      } as ChatCompletionMessageParam
    ];


    /**
     * Call OpenAI
     */
    console.log('[MessagesService] Calling OpenAI for completion...', { model, messageCount: messages.length, hasVision });
    let response;
    try {
      response = await this.openai.chat.completions.create({
        model,
        messages,
        // Only include tools for non-vision requests (vision + tools can conflict)
        ...(hasVision ? {} : {
          tools: [
            {
              type: "function" as const,
              function: {
                name: "search_products",
                description: "ONLY use when user explicitly asks to BUY or SHOP for pet products, food, toys, accessories. DO NOT use for health advice or symptom questions.",
                parameters: {
                  type: "object",
                  properties: {
                    pet_type: { 
                      type: "string",
                      description: "Type of pet (dog, cat, bird, etc.)"
                    },
                    query: { 
                      type: "string",
                      description: "Product search query"
                    }
                  },
                  required: ["query"]
                }
              }
            },
            {
              type: "function" as const,
              function: {
                name: "search_vets",
                description: "ONLY use when user explicitly asks to FIND a VET LOCATION, clinic, or hospital near them. NEVER use for symptoms, health issues, medical advice, or general questions. User must be looking for a physical vet location.",
                parameters: {
                  type: "object",
                  properties: {
                    city: { 
                      type: "string",
                      description: "City name"
                    },
                    area: { 
                      type: "string",
                      description: "Area or neighborhood name"
                    }
                  },
                  required: ["city"]
                }
              }
            }
          ]
        }),
        max_tokens: 1000
      });
    } catch (err: any) {
      console.error('[MessagesService] OpenAI API ERROR:', {
        status: err.status,
        message: err.message,
        type: err.type,
        code: err.code
      });
      throw err; // Re-throw to let Nest catch it for the 500 response
    }


    const message = response.choices[0].message;
    console.log('[MessagesService] OpenAI Completion result:', { content: message.content, tool_calls: message.tool_calls?.length || 0 });


    /**
     * Normal conversation (no tool used)
     */
    if (!message.tool_calls || message.tool_calls.length === 0) {
      return message.content;
    }


    const tool = message.tool_calls[0];

    if (tool.type !== "function") {
      return message.content;
    }


    let args: any = {};

    try {
      args = JSON.parse(tool.function.arguments || "{}");
    } catch (err) {
      console.error("Tool argument parse error:", err);
    }

    // For text extraction from multimodal content
    const queryText = typeof userContent === 'string' 
      ? userContent 
      : (Array.isArray(userContent) ? userContent.find(p => p.type === 'text')?.text || '' : '');

    if (!args.query) {
      args.query = queryText;
    }


    /**
     * PRODUCT SEARCH
     */
    if (tool.function.name === "search_products") {
      console.log('[MessagesService] Tool Match: search_products', args);

      const products = await this.productService.searchProducts({
        query: args.query,
        pet_type: args.pet_type || undefined,
        limit: 5
      });

      console.log('[MessagesService] search_products result count:', products?.length || 0);

      // 🚫 Safety check: if no results found, return the conversational advice instead of an empty search card
      if (!products || products.length === 0) {
        console.log('[MessagesService] Safety check: No products found, returning text only');
        return message.content || `I couldn't find any ${args.pet_type || 'pet'} products matching "${args.query}". This might be because we don't have that specific item in our database yet. Is there something else I can help you find?`;
      }

      return {
        type: "products",
        data: products,
        content: message.content
      };
    }


    if (tool.function.name === "search_vets") {
      console.log('[MessagesService] Tool Match: search_vets', args);

      // 🚫 Safety check: if city is missing, don't call the tool, return content (which should be the question "Which city?")
      if (!args.city) {
        console.log('[MessagesService] Safety check: Missing city, returning text only');
        return message.content || 'Please tell me which city you are in so I can help you find vets nearby.';
      }

      // 🔥 CRITICAL: If city is provided but NO area, ask for area (don't search yet)
      if (args.city && !args.area) {
        console.log('[MessagesService] City provided but no area - asking user for area');
        
        // List of major cities that need area specification
        const majorCities = ['chennai', 'mumbai', 'delhi', 'bangalore', 'hyderabad', 'kolkata', 'pune', 'ahmedabad'];
        const cityLower = args.city.toLowerCase();
        
        if (majorCities.includes(cityLower)) {
          return message.content || `${args.city} is a large city. Which area are you looking in? This will help me find vets closest to you.`;
        }
      }

      // Search for vets with both city and area (if provided)
      const vets = await this.vetService.search({
        city: args.city || undefined,
        area: args.area || undefined,
        // Note: Removed service filter to show all veterinary hospitals
        limit: 10
      });

      console.log('[MessagesService] search_vets result count:', vets?.length || 0);

      // 🔥 ENHANCED: If area was specified but no vets found, find nearby areas
      if (args.area && (!vets || vets.length === 0)) {
        console.log('[MessagesService] No vets in specified area, finding alternatives...');
        
        // Get all vets in the city to find available areas
        const cityVets = await this.vetService.search({
          city: args.city,
          // Note: Removed service filter to get all veterinary hospitals
          limit: 50 // Get more to find areas
        });

        if (cityVets && cityVets.length > 0) {
          // Extract unique areas from city vets
          const availableAreas = [...new Set(
            cityVets
              .map(v => v.area)
              .filter(a => a && a.trim().length > 0)
          )].slice(0, 5); // Top 5 areas

          console.log('[MessagesService] Available nearby areas:', availableAreas);

          // Return a special response asking user about alternative areas
          return {
            type: "no_vets_in_area",
            city: args.city,
            requestedArea: args.area,
            availableAreas: availableAreas,
            content: `I couldn't find any vets in ${args.area}, ${args.city}. However, I found vets in these nearby areas:\n\n${availableAreas.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\nWould you like me to show vets from any of these areas?`
          };
        }
      }

      // 🚫 Safety check: if no results found at all, return conversational message
      if (!vets || vets.length === 0) {
        console.log('[MessagesService] Safety check: No vets found in city, returning text only');
        return message.content || `I couldn't find any vets in ${args.city}. This might be because:\n\n1. We don't have vet data for this city yet\n2. The city name might be misspelled\n\nPlease try another city or check the spelling.`;
      }

      return {
        type: "vets",
        data: vets,
        content: message.content
      };
    }


    return message.content;
  }


  /**
   * Feedback
   */
  async feedback(messageId: string, userId: string, type: 'UP' | 'DOWN') {
    if (userId.startsWith('guest_')) return { success: true };

    const feedback = this.feedbackRepo.create({
      message_id: messageId,
      user_id: userId,
      type: type === 'UP' ? 'good' : 'bad',
    });

    return this.feedbackRepo.save(feedback);
  }

}