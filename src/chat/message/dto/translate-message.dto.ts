import { IsNotEmpty, IsString, IsIn } from 'class-validator';

// Add all the language codes you want to support
const supportedLanguages = ['en', 'es', 'fr', 'ur', 'ar', 'de', 'hi'];

export class TranslateMessageDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(supportedLanguages)
  targetLanguage: string;
}