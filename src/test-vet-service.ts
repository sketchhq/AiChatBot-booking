import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VeterinaryHospitalsService } from './modules/chatbot/veterinary-hospitals/veterinary-hospitals.service';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const vetService = app.get(VeterinaryHospitalsService);

  console.log('--- Testing VeterinaryHospitalsService.search ---');
  
  try {
    const results = await vetService.search({
      city: 'Chennai',
      area: 'Adyar',
      limit: 5
    });
    
    console.log(`Found ${results.length} vets in Adyar, Chennai.`);
    results.forEach(v => console.log(` - ${v.hospital_name} (${v.area})`));

    if (results.length > 0) {
      console.log('✅ SUCCESS: Database search returned results.');
    } else {
      console.log('⚠️ WARNING: No results found in Adyar, Chennai. Checking city-wide...');
      const cityResults = await vetService.search({ city: 'Chennai', limit: 5 });
      console.log(`Found ${cityResults.length} vets in Chennai.`);
    }
  } catch (error) {
    console.error('❌ ERROR during testing:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
