const axios = require('axios');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZWEwMzNmZjUtM2Y4Yy00MjQyLTkxODEtY2FhNDFkODAzMjU5Iiwicm9sZSI6IkNVU1RPTUVSIiwiYWNjb3VudF9zdGF0dXMiOiJQRU5ESU5HIiwiaWF0IjoxNzczOTA0NDQ3LCJleHAiOjE3NzQ1MDkyNDd9.yuU329lIIiNa0CLoLhXn59Yg5PyuFwt66a2TwcucFOo';
const API_BASE = 'http://localhost:8080/api/v1/chatbot';

async function verifyVet() {
  console.log('--- Verifying Vet Search Tool (V3) ---');
  
  try {
    // 1. Get/Create chat
    const chatsRes = await axios.get(`${API_BASE}/chats`, { headers: { Authorization: `Bearer ${TOKEN}` } });
    const chatId = chatsRes.data && chatsRes.data.length > 0 ? chatsRes.data[0].id : (await axios.post(`${API_BASE}/chats`, { title: 'Test Vet' }, { headers: { Authorization: `Bearer ${TOKEN}` } })).data.id;

    // 2. Send vet search message
    console.log('Sending message "find a vet in Adyar, Chennai"...');
    const msgRes = await axios.post(`${API_BASE}/messages`, {
      chat_id: chatId,
      content: 'find a vet in Adyar, Chennai',
      role: 'user'
    }, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    console.log('Response status:', msgRes.status);
    const aiMsg = msgRes.data.aiMsg || msgRes.data;
    console.log('AI Response Type:', aiMsg.type);
    
    if (aiMsg.type === 'vets' || aiMsg.vets?.length > 0) {
      console.log('✅ SUCCESS: search_vets tool was triggered and returned data.');
      console.log('Vets found:', aiMsg.data?.length || aiMsg.vets?.length || 0);
    } else {
      console.log('⚠️ WARNING: Tool call not clearly identified in response object, but status is 201.');
      console.log('AI Response Content:', JSON.stringify(aiMsg, null, 2));
    }

  } catch (error) {
    console.error('❌ ERROR:', error.response?.status, error.response?.data || error.message);
  }
}

verifyVet();
