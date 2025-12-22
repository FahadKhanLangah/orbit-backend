import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ContentModerationService {

  private readonly bannedKeywords = [
    'gun', 'weapon', 'rifle', 'pistol',
    'drugs', 'cocaine', 'heroin', 'weed',
    'explosive', 'bomb', 'counterfeit', 'fake id'
  ];

  private readonly scamPatterns = [
    { pattern: /whatsapp|telegram|viber/i, reason: "Attempt to move chat off-platform" },
    { pattern: /zelle|cashapp|venmo|western union|moneygram/i, reason: "High-risk payment method detected" },
    { pattern: /courier|fedex agent|ups agent/i, reason: "Common 'Courier Pickup' scam detected" },
    { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, reason: "Sharing email address is risky" }
  ];

  checkProhibitedContent(text: string): void {
    const lowerText = text.toLowerCase();
    for (const word of this.bannedKeywords) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(lowerText)) {
        throw new BadRequestException(`Listing contains prohibited content: '${word}'. Please remove it.`);
      }
    }
  }

  analyzeRisk(text: string): { isRisky: boolean; warning?: string } {
    for (const rule of this.scamPatterns) {
      if (rule.pattern.test(text)) {
        return { isRisky: true, warning: rule.reason };
      }
    }
    return { isRisky: false };
  }
}