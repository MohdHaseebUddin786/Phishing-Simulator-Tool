import { GoogleGenerativeAI } from '@google/generative-ai';
import { DetectionResult, DetectionType, ThreatLevel } from '../types';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export const analyzeWithGemini = async (
  input: string | File,
  type: DetectionType
): Promise<DetectionResult> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    let content = '';
    if (typeof input === 'string') {
      content = input;
    } else {
      content = await input.text();
    }

    const prompt = `You are an advanced cybersecurity AI specialized in phishing detection. Analyze the following ${type} content and provide a detailed threat assessment.

Content to analyze:
"""
${content}
"""

Provide your analysis in the following JSON format (respond ONLY with valid JSON, no other text):
{
  "threatLevel": "safe" | "suspicious" | "malicious",
  "confidence": <number between 70-95>,
  "redFlags": [<array of specific red flags found>],
  "analysis": {
    "spoofedSender": <boolean>,
    "suspiciousLinks": [<array of suspicious URLs found>],
    "urgentLanguage": <boolean>,
    "socialEngineering": <boolean>,
    "misspelledDomains": [<array of misspelled domain names>],
    "attachmentRisk": <boolean>
  }
}

Evaluation Criteria:
- SAFE (0-29 points): No significant threats detected
- SUSPICIOUS (30-59 points): Contains concerning characteristics that warrant caution
- MALICIOUS (60+ points): Clear phishing attempt with multiple high-risk indicators

Look for:
1. Sender spoofing (mismatched email addresses, suspicious domains)
2. Suspicious URLs (shortened links, IP addresses, misspelled domains like micros0ft.com, paypa1.com)
3. Urgent language (immediate action required, account suspension, verify now)
4. Social engineering (pressure tactics, fear, urgency, requests for sensitive info)
5. Typosquatting (domains that look similar to legitimate ones)
6. Grammar/spelling errors
7. Generic greetings
8. Requests for personal/financial information
9. Suspicious attachments
10. Multiple links or redirects

Be thorough and precise in identifying red flags.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }

    const analysis: DetectionResult = JSON.parse(jsonMatch[0]);

    if (!analysis.redFlags || analysis.redFlags.length === 0) {
      analysis.redFlags = ['No significant threats detected'];
    }

    return analysis;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};

export const generateChatResponse = async (
  userMessage: string,
  detectionResult: DetectionResult
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are a cybersecurity assistant helping users understand phishing threats and how to stay safe online.

Detection Context:
- Threat Level: ${detectionResult.threatLevel}
- Confidence: ${detectionResult.confidence}%
- Red Flags: ${detectionResult.redFlags.join(', ')}
- Analysis: ${JSON.stringify(detectionResult.analysis)}

User Question: "${userMessage}"

Provide a clear, actionable, and educational response. Your response should:
1. Be conversational and empathetic
2. Explain technical concepts in simple terms
3. Provide specific, actionable steps when relevant
4. Educate the user about cybersecurity best practices
5. Use formatting like bullet points for clarity
6. Be concise but comprehensive (3-8 paragraphs max)

If the threat is malicious or suspicious, emphasize:
- Immediate actions to take (delete, don't click, don't reply)
- How to report the threat
- Why specific elements are dangerous
- How to prevent similar attacks in the future

If the threat is safe but the user asks questions, still provide educational content about:
- How to identify phishing attempts
- Best security practices
- What to look for in legitimate communications

Respond in a helpful, professional tone.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini Chat Error:', error);
    return `I apologize, but I'm having trouble generating a response right now. Here's what you should know:

If this content is ${detectionResult.threatLevel}:
${detectionResult.threatLevel === 'malicious' || detectionResult.threatLevel === 'suspicious'
  ? '- DELETE the message immediately\n- DO NOT click any links\n- DO NOT download attachments\n- Report it to your email provider\n- Run a security scan if you clicked anything'
  : '- The content appears safe, but always remain vigilant\n- Verify sender identity when in doubt\n- Look for HTTPS in URLs\n- Be cautious with urgent requests'}

Please try asking your question again, or contact your IT security team for assistance.`;
  }
};
