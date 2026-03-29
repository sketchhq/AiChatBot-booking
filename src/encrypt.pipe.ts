import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
// import * as CryptoJS from 'crypto-js'

export class EncryptionPipe extends ValidationPipe {


  //   'YourSecretKey'; // Replace with your own secret key

  async transform(value: any, metadata: ArgumentMetadata) {
    //     var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(value), 'secret key 123').toString();
    // console.log("ciphertext",ciphertext)

    // var bytes  = CryptoJS.AES.decrypt(value.data, 'secret key 123');
    // var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    // console.log("decryptedData",decryptedData)

    return super.transform(value, metadata);
  }
  //  async decrypt(input_data: string) {
  //     let decipher = 

  //   return decipher
  //     }

  //   decryptValue = (input_data: any) => {

  //   };

  //   private decrypt(encryptedText: any): Promise<any> {
  //     console.log(encryptedText.data)

  //     return new Promise((resolve, reject) => {
  //       const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey,process.env.ECY_IV);
  //       let decrypted = decipher.update(encryptedText.data, "base64", "utf8");
  //       decrypted += decipher.final('utf8');
  //       console.log(JSON.stringify(decrypted))
  //       resolve(decrypted);
  //     });
  //   }
}
