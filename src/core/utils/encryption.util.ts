import * as CryptoJS from 'crypto-js';
const SECRET_KEY = process.env.AES_SECRET_KEY;

export const AES = {
  

  encrypt: (data: any): string => {
  const json = typeof data === 'string' ? JSON.stringify(data) : JSON.stringify(data);
  return CryptoJS.AES.encrypt(json, SECRET_KEY).toString();
},

  

decrypt: (cipherText: string): any => {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

  if (!decryptedText) {
    throw new Error('Decryption failed — possibly due to wrong key or malformed ciphertext');
  }

  try {
    return JSON.parse(decryptedText); // handles JSON
  } catch {
    return decryptedText; // fallback for plain string
  }
}


};
