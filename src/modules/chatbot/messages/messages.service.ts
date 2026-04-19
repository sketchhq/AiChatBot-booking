import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from '../messages/entities/messages.entity';
import { Chat } from '../chats/entities/chats.entity';
import { Repository } from 'typeorm';
import { ProductRecommendationsService } from '../product-recommendations/recommendations.service';
import { VeterinaryHospitalsService } from '../veterinary-hospitals/veterinary-hospitals.service';
import { ChatbotFeedback } from '../feedback/entities/feedback.entity';
import { AppointmentsService } from 'src/modules/appointments/appointments.service';
import Groq from "groq-sdk";
import { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';
import { createClient } from 'redis';

interface ConversationState {
  stage: 'GREETING' | 'INTAKE' | 'SYMPTOMS' | 'URGENCY' | 'SLOTS' | 'BOOKING';
  symptoms?: {
    chief_complaint?: string;
    duration?: string;
    severity?: number;
    urgency_level?: 'low' | 'medium' | 'high' | 'emergency';
    analysis?: any;
  };
  selected_slot?: any;
  doctor_speciality?: string;
}

@Injectable()
export class MessagesService {
  private groq: Groq;
  private redisClient: any | null = null;
  private redisConnected = false;
  private localConversationState = new Map<string, ConversationState>();

  constructor(
    @InjectRepository(Message)
    private repo: Repository<Message>,

    @InjectRepository(Chat)
    private chatRepo: Repository<Chat>,

    private productService: ProductRecommendationsService,

    private vetService: VeterinaryHospitalsService,

    @InjectRepository(ChatbotFeedback)
    private feedbackRepo: Repository<ChatbotFeedback>,

    private appointmentsService: AppointmentsService,
  ) {
    const key = process.env.GROQ_API_KEY;
    console.log('[MessagesService] Groq Key Diagnostic:', {
      length: key?.length || 0,
      start: key?.substring(0, 15),
      end: key?.substring((key?.length || 0) - 4)
    });

    if (!key) {
      throw new Error('GROQ_API_KEY is required for MessagesService');
    }

    this.groq = new Groq({ apiKey: key });

    const redisUrl = process.env.REDIS_URL;
    if (redisUrl && redisUrl !== 'false') {
      this.redisClient = createClient({ url: redisUrl });

      this.redisClient.on('ready', () => {
        this.redisConnected = true;
        console.log('[MessagesService] Redis connected:', redisUrl);
      });

      this.redisClient.on('error', (err) => {
        console.error('[MessagesService] Redis Client Error:', err);
      });

      this.redisClient.connect().catch(err => {
        console.error('[MessagesService] Redis connection failed:', err);
      });
    } else {
      console.log('[MessagesService] Redis disabled: REDIS_URL not set or disabled. Using in-memory conversation state.');
    }
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
    const aiText = ai; // ai is now always a string from smartAI
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

      const response = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
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
   * Parse stored content string into AI-compatible message content.
   * Handles both plain text and JSON-encoded multimodal content (image_url, file).
   */
  private parseContentForAI(content: string): string | any[] {
    if (!content) return content;

    try {
      const trimmed = content.trim();
      if (trimmed.startsWith('[')) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasImage = parsed.some(p => p.type === 'image_url');
          const hasFile = parsed.some(p => p.type === 'file');

          if (hasImage || hasFile) {
            // Build AI multimodal content array
            const parts: any[] = [];

            for (const part of parsed) {
              if (part.type === 'text') {
                parts.push({ type: 'text', text: part.text || '' });
              } else if (part.type === 'image_url') {
                // Normalize image_url format for AI
                const url = typeof part.image_url === 'string'
                  ? part.image_url
                  : part.image_url?.url || part.image_url;
                parts.push({
                  type: 'image_url',
                  image_url: { url }
                });
              } else if (part.type === 'file') {
                // For files, describe them as text since AI can't read arbitrary files
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

  /**
   * Get conversation state from Redis
   */
  private async getConversationState(chatId: string): Promise<ConversationState> {
    if (!this.redisClient || !this.redisConnected) {
      return this.localConversationState.get(chatId) || { stage: 'GREETING' };
    }

    try {
      const stateKey = `chat_state:${chatId}`;
      const stateData = await this.redisClient.get(stateKey);
      if (stateData) {
        return JSON.parse(stateData);
      }
    } catch (err) {
      console.error('[MessagesService] Error getting conversation state:', err);
    }

    return { stage: 'GREETING' };
  }

  /**
   * Set conversation state in Redis or in-memory fallback
   */
  private async setConversationState(chatId: string, state: ConversationState): Promise<void> {
    if (!this.redisClient || !this.redisConnected) {
      this.localConversationState.set(chatId, state);
      return;
    }

    try {
      const stateKey = `chat_state:${chatId}`;
      await this.redisClient.setEx(stateKey, 3600, JSON.stringify(state)); // 1 hour expiry
    } catch (err) {
      console.error('[MessagesService] Error setting conversation state:', err);
    }
  }

  async smartAI(query: string, chatId: string, frontendHistory?: any[]) {
    // Get current conversation state
    const currentState = await this.getConversationState(chatId);
    console.log('[MessagesService] Current state:', currentState);

    // Handle state transitions based on user input
    let response: string;
    let nextState = { ...currentState };

    try {
      switch (currentState.stage) {
        case 'GREETING':
          if (query.toLowerCase().includes('book') || query.toLowerCase().includes('appointment')) {
            response = "Great! I'd be happy to help you book an appointment. What's bringing you in today? Please describe your main concern.";
            nextState.stage = 'INTAKE';
          } else {
            response = "Hello! I'm MedBot, your AI appointment assistant. Are you looking to book an appointment today?";
          }
          break;

        case 'INTAKE':
          // Use Groq to analyze the chief complaint and extract symptoms
          const symptomAnalysis = await this.analyzeSymptomsWithGroq(query);
          console.log('[MessagesService] Symptom analysis:', symptomAnalysis);

          response = `I understand you're experiencing: "${query}".

To help you get the right care, I need to ask a few questions:

1. How long have you had this issue?
2. On a scale of 1-10, how severe is it?

Please answer one at a time, starting with the duration.`;
          nextState.stage = 'SYMPTOMS';
          nextState.symptoms = {
            chief_complaint: query,
            analysis: symptomAnalysis
          };
          break;

        case 'SYMPTOMS':
          // Collect duration and severity, then use Groq for urgency assessment
          if (!currentState.symptoms?.duration) {
            nextState.symptoms = { ...currentState.symptoms, duration: query };
            response = "Thanks. Now, on a scale of 1-10 (where 1 is mild discomfort and 10 is severe pain), how would you rate the severity?";
          } else if (!currentState.symptoms?.severity) {
            const severity = parseInt(query) || 5;
            nextState.symptoms = { ...currentState.symptoms, severity };

            // Use Groq to assess urgency based on symptoms
            const urgencyAssessment = await this.assessUrgencyWithGroq(
              currentState.symptoms.chief_complaint,
              currentState.symptoms.duration,
              severity
            );
            console.log('[MessagesService] Urgency assessment:', urgencyAssessment);

            nextState.symptoms.urgency_level = urgencyAssessment.urgency;
            nextState.stage = 'URGENCY';

            if (urgencyAssessment.urgency === 'emergency') {
              response = `🚨 **EMERGENCY ALERT**: ${urgencyAssessment.reason}

**Please call emergency services (112) right now or go to the nearest emergency room.**

If this is not an emergency and you'd still like to book an appointment, let me know.`;
            } else {
              response = `Thank you for that information. Based on your symptoms, I recommend seeing a doctor.

**Summary:**
- Concern: ${currentState.symptoms.chief_complaint}
- Duration: ${currentState.symptoms.duration}
- Severity: ${severity}/10
- Urgency: ${urgencyAssessment.urgency.toUpperCase()}

Would you like me to show you available appointment slots now?`;
              nextState.stage = 'SLOTS';
            }
          } else {
            response = "I'm sorry, I didn't understand that. Please tell me how long you've had this issue.";
          }
          break;

        case 'SLOTS':
          if (query.toLowerCase().includes('yes') || query.toLowerCase().includes('show') || query.toLowerCase().includes('slots')) {
            response = "Great! Here are some available appointment slots with our doctors. Please select one:\n\n" +
              "🩺 **Dr. Sharma** (General Physician)\n" +
              "• Today 2:00 PM\n" +
              "• Tomorrow 10:00 AM\n\n" +
              "🩺 **Dr. Patel** (General Physician)\n" +
              "• Today 4:00 PM\n" +
              "• Tomorrow 11:00 AM\n\n" +
              "Reply with the doctor name and time you'd prefer (e.g., 'Dr. Sharma today 2pm').";
            nextState.stage = 'BOOKING';
          } else {
            response = "No problem. Let me know when you'd like to see the available slots.";
          }
          break;

        case 'BOOKING':
          // Simple slot selection parsing
          const slotMatch = query.match(/(Dr\.\s*\w+)\s+(today|tomorrow)\s+(\d+)(?::(\d+))?\s*(am|pm)/i);
          if (slotMatch) {
            const [, doctor, day, hour, minute, period] = slotMatch;
            const time = `${hour}:${minute || '00'} ${period.toUpperCase()}`;

            // Actually book the appointment
            const bookingResult = await this.bookAppointment(
              userId, 
              doctor, 
              day, 
              time, 
              currentState.symptoms?.chief_complaint
            );

            if (bookingResult.success) {
              response = `✅ **Appointment Confirmed!**

**Doctor:** ${doctor}
**Date:** ${day === 'today' ? 'Today' : 'Tomorrow'}
**Time:** ${time}
**Appointment Code:** ${bookingResult.appointment_code}

You'll receive a confirmation message with all the details. Please arrive 15 minutes early.

Is there anything else I can help you with?`;
            } else {
              response = `❌ **Booking Failed**

${bookingResult.error}

Please try selecting a different slot or contact support.`;
            }
            nextState.stage = 'GREETING'; // Reset for next conversation
          } else {
            response = "I didn't understand that slot selection. Please reply with the doctor name and time (e.g., 'Dr. Sharma today 2pm').";
          }
          break;

        default:
          response = "Hello! I'm MedBot. Are you looking to book an appointment?";
          nextState.stage = 'GREETING';
      }
    } catch (error) {
      console.error('[MessagesService] Error in smartAI:', error);
      response = "I'm sorry, I'm having trouble processing your request. Please try again.";
    }

    // Save the updated state
    await this.setConversationState(chatId, nextState);

    return response;
  }

  /**
   * Analyze symptoms using Groq AI
   */
  private async analyzeSymptomsWithGroq(symptoms: string): Promise<any> {
    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are a medical symptom analyzer. Analyze the patient's symptoms and return a JSON object with:
            {
              "possible_conditions": ["condition1", "condition2"],
              "recommended_specialty": "specialty_name",
              "severity_estimate": "low|medium|high",
              "red_flags": ["flag1", "flag2"] // any concerning symptoms
            }`
          },
          {
            role: 'user',
            content: `Patient symptoms: ${symptoms}`
          }
        ],
        max_tokens: 300
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        try {
          return JSON.parse(content);
        } catch (e) {
          console.log('[MessagesService] Groq symptom analysis (raw):', content);
          return { possible_conditions: [], recommended_specialty: 'General Physician', severity_estimate: 'medium', red_flags: [] };
        }
      }
    } catch (error) {
      console.error('[MessagesService] Groq symptom analysis error:', error);
    }

    return { possible_conditions: [], recommended_specialty: 'General Physician', severity_estimate: 'medium', red_flags: [] };
  }

  /**
   * Assess urgency using Groq AI
   */
  private async assessUrgencyWithGroq(chiefComplaint: string, duration: string, severity: number): Promise<{urgency: 'low' | 'medium' | 'high' | 'emergency', reason: string}> {
    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are a medical triage assistant. Based on symptoms, duration, and severity (1-10), determine urgency level.

Return JSON: {"urgency": "low|medium|high|emergency", "reason": "brief explanation"}

Emergency criteria:
- Chest pain, shortness of breath, severe bleeding
- Severe pain (8-10) with neurological symptoms
- High fever with confusion
- Severe allergic reactions

High priority:
- Moderate to severe pain (6-9)
- Difficulty breathing
- High fever
- Severe headache with vomiting`
          },
          {
            role: 'user',
            content: `Symptoms: ${chiefComplaint}, Duration: ${duration}, Severity: ${severity}/10`
          }
        ],
        max_tokens: 200
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        try {
          const result = JSON.parse(content);
          return {
            urgency: result.urgency || 'medium',
            reason: result.reason || 'Standard medical evaluation recommended'
          };
        } catch (e) {
          console.log('[MessagesService] Groq urgency assessment (raw):', content);
        }
      }
    } catch (error) {
      console.error('[MessagesService] Groq urgency assessment error:', error);
    }

    // Fallback logic
    let urgency: 'low' | 'medium' | 'high' | 'emergency' = 'low';
    let reason = 'Standard medical evaluation recommended';

    if (severity >= 9) {
      urgency = 'emergency';
      reason = 'High severity symptoms require immediate attention';
    } else if (severity >= 7) {
      urgency = 'high';
      reason = 'Moderate to high severity symptoms should be evaluated soon';
    } else if (severity >= 5) {
      urgency = 'medium';
      reason = 'Moderate symptoms warrant medical attention';
    }

    return { urgency, reason };
  }

  /**
   * Book an appointment using the vet appointments service
   */
  private async bookAppointment(userId: string, doctorName: string, date: string, time: string, symptoms?: string) {
    try {
      // Find the doctor/vet by name (simplified - in real app would have better lookup)
      const doctorMap = {
        'Dr. Sharma': '550e8400-e29b-41d4-a716-446655440001', // Mock UUIDs for now
        'Dr. Patel': '550e8400-e29b-41d4-a716-446655440002',
      };

      const vetId = doctorMap[doctorName as keyof typeof doctorMap];
      if (!vetId) {
        throw new Error(`Doctor ${doctorName} not found`);
      }

      // Parse date and time
      const appointmentDate = date === 'today' ? new Date().toISOString().split('T')[0] : 
                             date === 'tomorrow' ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
                             date;

      // Convert time to start/end times (assuming 30 min slots)
      const [hourStr, minuteStr, period] = time.split(/[:\s]/);
      let hour = parseInt(hourStr);
      if (period?.toLowerCase() === 'pm' && hour !== 12) hour += 12;
      if (period?.toLowerCase() === 'am' && hour === 12) hour = 0;

      const startTime = `${hour.toString().padStart(2, '0')}:${minuteStr || '00'}`;
      const endHour = hour + (minuteStr ? 0 : 0) + 0; // Assuming 30 min slots
      const endTime = `${(hour + 0).toString().padStart(2, '0')}:${minuteStr || '30'}`;

      // Create appointment
      const appointmentDto = {
        doctor_id: vetId,
        consultation_type: 'ONLINE' as const,
        appointment_date: appointmentDate,
        slot_start_time: startTime,
        slot_end_time: endTime,
        symptoms: symptoms || 'General consultation',
        appointment_type: 'Consultation',
      };

      // Create a mock user object for guest users
      const mockUser = { id: userId, sub: userId };

      const appointment = await this.appointmentsService.create(appointmentDto, mockUser);
      
      return {
        success: true,
        appointment_code: appointment.appointment_code,
        appointment_id: appointment.id,
        doctor: doctorName,
        date: appointmentDate,
        time: startTime,
      };
    } catch (error) {
      console.error('[MessagesService] Booking error:', error);
      return {
        success: false,
        error: error.message || 'Failed to book appointment',
      };
    }
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