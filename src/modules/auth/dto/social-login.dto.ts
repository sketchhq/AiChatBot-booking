
import { IsString, IsNotEmpty } from 'class-validator';

export class SocialLoginDto {
  @IsNotEmpty()
  @IsString()
  provider: 'google' | 'facebook' | 'apple';

  @IsNotEmpty()
  @IsString()
  token: string; // id_token for Google/Apple, access_token for Facebook
}
