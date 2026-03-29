import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MessagesService } from './modules/chatbot/messages/messages.service';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const messagesService = app.get(MessagesService);

  console.log('\n--- 🧪 STARTING VERIFICATION TESTS ---\n');

  const chatId = 'test-chat-' + Date.now();

  try {
    // TEST 1: The "Chennai" Null Issue
    console.log('Test 1: "nearby vet" -> "chennai"');
    console.log('Step 1.1: "nearby vet"');
    const r1 = await messagesService.smartAI('nearby vet', chatId);
    console.log('Response:', r1);

    console.log('\nStep 1.2: "chennai"');
    const r2 = await messagesService.smartAI('chennai', chatId);
    console.log('Response:', JSON.stringify(r2, null, 2));
    
    if (r2 !== null && typeof r2 === 'string' && r2.toLowerCase().includes('area')) {
      console.log('✅ TEST 1 PASSED: Correctly asked for area instead of returning null.');
    } else {
      console.log('❌ TEST 1 FAILED: Did not ask for area or returned null.');
    }

    // TEST 2: Full Flow with Area
    console.log('\nTest 2: Follow up with "adyar"');
    const r3 = await messagesService.smartAI('adyar', chatId);
    // console.log('Response:', JSON.stringify(r3, null, 2));
    if (typeof r3 === 'object' && r3.type === 'vets') {
      console.log(`✅ TEST 2 PASSED: Successfully returned ${r3.data?.length || 0} vets.`);
    } else {
      console.log('❌ TEST 2 FAILED: Failed to return vet cards for Adyar.');
    }

    // TEST 3: Direct City + Area
    console.log('\nTest 3: Direct "vets in chennai adyar"');
    const r4 = await messagesService.smartAI('vets in chennai adyar', 'new-chat-' + Date.now());
    if (typeof r4 === 'object' && r4.type === 'vets') {
      console.log(`✅ TEST 3 PASSED: Successfully returned ${r4.data?.length || 0} vets immediately.`);
    } else {
      console.log('❌ TEST 3 FAILED: Failed direct search.');
    }

  } catch (error) {
    console.error('❌ ERROR during testing:', error);
  } finally {
    await app.close();
    console.log('\n--- 🧪 TESTS COMPLETED ---\n');
  }
}

bootstrap();

