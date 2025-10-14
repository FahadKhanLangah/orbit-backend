import { Injectable, Logger } from '@nestjs/common';
import { v2 } from '@google-cloud/translate';

@Injectable()
export class TranslationService {
  private readonly translate: v2.Translate;
  private readonly logger = new Logger(TranslationService.name);

  constructor() {
    this.translate = new v2.Translate({
      projectId: 'your-gcp-project-id', 
      keyFilename: 'path/to/your/service-account-key.json', 
    });
  }

  async detectLanguage(text: string): Promise<string> {
    if (!text || text.trim().length < 2) return 'en'; 

    try {
      const [detections] = await this.translate.detect(text);
      const detection = Array.isArray(detections) ? detections[0] : detections;
      return detection.language;
    } catch (error) {
      this.logger.error('Failed to detect language', error);
      return 'en';
    }
  }


  async translateText(text: string, targetLang: string): Promise<string> {
    if (!text || text.trim().length === 0) return '';

    try {
      const [translation] = await this.translate.translate(text, targetLang);
      return translation;
    } catch (error) {
      this.logger.error(`Failed to translate text to ${targetLang}`, error);
      return text; 
    }
  }
}