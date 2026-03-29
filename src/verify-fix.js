const axios = require('axios');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZWEwMzNmZjUtM2Y4Yy00MjQyLTkxODEtY2FhNDFkODAzMjU5Iiwicm9sZSI6IkNVU1RPTUVSIiwiYWNjb3VudF9zdGF0dXMiOiJQRU5ESU5HIiwiaWF0IjoxNzczOTA0NDQ3LCJleHAiOjE3NzQ1MDkyNDd9.yuU329lIIiNa0CLoLhXn59Yg5PyuFwt66a2TwcucFOo';
const API_BASE = 'http://localhost:8080/api/v1/chatbot';

async function verify() {
  console.log('--- Verifying Fix (V2) ---');
  
  try {
    // 1. Get chats
    console.log('Fetching chats from:', `${API_BASE}/chats`);
    const chatsRes = await axios.get(`${API_BASE}/chats`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    
    console.log('Chats fetched:', chatsRes.data?.length || 0);

    let chatId;
    if (chatsRes.data && chatsRes.data.length > 0) {
      chatId = chatsRes.data[0].id;
      console.log(`Using existing chat: ${chatId}`);
    } else {
      console.log('Creating new chat...');
      const newChatRes = await axios.post(`${API_BASE}/chats`, { title: 'Test Chat' }, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      chatId = newChatRes.data.id || (Array.isArray(newChatRes.data) ? newChatRes.data[0].id : null);
      console.log(`Created new chat: ${chatId}`);
    }

    if (!chatId) throw new Error('Could not determine chatId');

    // 2. Send message
    console.log('Sending message "hello" to chat:', chatId);
    const msgRes = await axios.post(`${API_BASE}/messages`, {
      chat_id: chatId,
      content: 'hello',
      role: 'user'
    }, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    console.log('Response status:', msgRes.status);
    console.log('AI Response:', JSON.stringify(msgRes.data.aiMsg?.content || msgRes.data, null, 2));
    
    if (msgRes.status === 201 || msgRes.status === 200) {
      console.log('✅ SUCCESS: Chatbot responded correctly.');
    } else {
      console.log('❌ FAILED: Unexpected response status.');
    }

  } catch (error) {
    if (error.response) {
      console.error('❌ API ERROR:', error.response.status, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ ERROR:', error.message);
    }
  }
}

verify();
