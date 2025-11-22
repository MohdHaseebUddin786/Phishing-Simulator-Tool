import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, XCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { ChatMessage, DetectionResult } from '../types';
import { generateChatResponse } from '../utils/geminiDetection';

interface ChatBotProps {
  detectionResult: DetectionResult | null;
}

export default function ChatBot({ detectionResult }: ChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (detectionResult) {
      const initialMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: generateInitialAnalysis(detectionResult),
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
    }
  }, [detectionResult]);

  const generateInitialAnalysis = (result: DetectionResult): string => {
    const { threatLevel, confidence, redFlags, analysis } = result;

    let message = `I've analyzed the content and detected a **${threatLevel.toUpperCase()}** threat level with ${confidence}% confidence.\n\n`;

    if (threatLevel === 'malicious') {
      message += '⚠️ **CRITICAL WARNING**: This content is highly dangerous!\n\n';
    } else if (threatLevel === 'suspicious') {
      message += '⚠️ **CAUTION**: This content shows suspicious characteristics.\n\n';
    } else {
      message += '✅ **GOOD NEWS**: This content appears safe.\n\n';
    }

    if (redFlags.length > 0) {
      message += '**Red Flags Identified:**\n';
      redFlags.forEach((flag, idx) => {
        message += `${idx + 1}. ${flag}\n`;
      });
      message += '\n';
    }

    message += '**Detailed Findings:**\n';
    if (analysis.spoofedSender) {
      message += '• The sender address appears to be spoofed or fake\n';
    }
    if (analysis.suspiciousLinks && analysis.suspiciousLinks.length > 0) {
      message += `• Found ${analysis.suspiciousLinks.length} suspicious link(s)\n`;
    }
    if (analysis.urgentLanguage) {
      message += '• Urgent language designed to pressure you into acting quickly\n';
    }
    if (analysis.socialEngineering) {
      message += '• Social engineering tactics attempting to manipulate you\n';
    }
    if (analysis.misspelledDomains && analysis.misspelledDomains.length > 0) {
      message += `• Misspelled domains detected: ${analysis.misspelledDomains.join(', ')}\n`;
    }
    if (analysis.attachmentRisk) {
      message += '• Attachment contains potential malware or risks\n';
    }

    message += '\n**What should you do?** Ask me for specific recommendations!';

    return message;
  };

  const generateResponse = (userInput: string, result: DetectionResult): string => {
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes('what') && lowerInput.includes('do')) {
      if (result.threatLevel === 'malicious' || result.threatLevel === 'suspicious') {
        return `**Immediate Actions to Take:**

1. **DELETE the message immediately** - Don't keep it in your inbox
2. **DO NOT click any links** - They may lead to malicious websites
3. **DO NOT download attachments** - They could contain malware
4. **DO NOT reply or forward** - This confirms your email/number is active
5. **REPORT the phishing attempt** to your email provider or IT department

**Additional Protection:**
• Mark the sender as spam/block them
• Run a security scan with updated antivirus software
• Change passwords if you've already clicked any links
• Enable two-factor authentication on your accounts
• Monitor your accounts for suspicious activity

Would you like more details about any of these steps?`;
      } else {
        return `Since this content appears safe, no immediate action is required. However, always remain vigilant and:

• Verify sender identity when in doubt
• Hover over links before clicking to see the real destination
• Look for HTTPS in URLs
• Be cautious with urgent requests
• Trust your instincts - if something feels off, it probably is`;
      }
    }

    if (lowerInput.includes('delete') || lowerInput.includes('remove')) {
      return `**How to Safely Delete:**

1. **Don't just move to trash** - Permanently delete it
2. **Empty your trash/deleted items folder** after removal
3. **Block the sender** to prevent future messages
4. **Clear browser cache** if you accidentally visited any links

This prevents accidental clicks and ensures the message is completely removed from your system.`;
    }

    if (lowerInput.includes('report')) {
      return `**How to Report Phishing:**

**For Email:**
• Gmail: Use "Report phishing" option (three dots menu)
• Outlook: Click "Report message" → "Phishing"
• Apple Mail: Forward to abuse@[provider].com
• Report to Anti-Phishing Working Group: reportphishing@apwg.org

**For SMS:**
• Forward to 7726 (SPAM) - works for most carriers
• Report in your carrier's spam reporting system
• Block the number immediately

**Additional Reporting:**
• Federal Trade Commission: ReportFraud.ftc.gov
• IC3 (FBI): ic3.gov (for financial fraud)

Reporting helps protect others from falling victim to the same scam!`;
    }

    if (lowerInput.includes('link') || lowerInput.includes('click')) {
      if (result.analysis.suspiciousLinks && result.analysis.suspiciousLinks.length > 0) {
        return `**About the Suspicious Links:**

The links in this message are dangerous because:
• They may lead to fake login pages designed to steal credentials
• They could download malware onto your device
• They often mimic legitimate websites with slight spelling variations

**How to Identify Suspicious Links:**
• Hover over links to see the real URL (don't click!)
• Look for misspellings: micros0ft.com instead of microsoft.com
• Check for strange characters or extra subdomains
• Be wary of shortened URLs (bit.ly, tinyurl, etc.)
• Legitimate companies rarely send unsolicited links

**If you already clicked:**
1. Don't enter any information
2. Close the browser immediately
3. Run antivirus scan
4. Change your passwords
5. Monitor your accounts`;
      }
    }

    if (lowerInput.includes('sender') || lowerInput.includes('who')) {
      if (result.analysis.spoofedSender) {
        return `**About Sender Spoofing:**

The sender's email/number is likely fake or spoofed. Attackers use techniques to make messages appear from legitimate sources.

**How to Verify Senders:**
• Check the full email address, not just the display name
• Legitimate companies use official domains (e.g., @company.com, not @company-secure.com)
• Contact the supposed sender through official channels to verify
• Look for slight misspellings in domain names
• Be suspicious of personal email addresses from "companies"

**Red flags in this sender:**
• Email address doesn't match the claimed organization
• Uses free email service (gmail, yahoo) for "official" business
• Contains numbers or random characters
• Domain is recently registered`;
      }
    }

    if (lowerInput.includes('protect') || lowerInput.includes('prevent') || lowerInput.includes('safe')) {
      return `**Cybersecurity Best Practices:**

**Prevention Strategies:**
1. **Enable multi-factor authentication (MFA)** on all accounts
2. **Use a password manager** with unique passwords
3. **Keep software updated** - enable automatic updates
4. **Install reputable antivirus software**
5. **Use email filters** and spam protection

**Recognition Skills:**
• Be skeptical of urgent requests
• Verify unexpected requests through official channels
• Look for spelling/grammar errors
• Check sender addresses carefully
• Don't trust caller ID or display names alone

**Safe Habits:**
• Never share passwords or sensitive info via email/SMS
• Hover before clicking links
• Verify requests for money or data transfers
• Use separate email for important accounts
• Regularly monitor account activity

**Education:**
• Stay informed about latest phishing tactics
• Share knowledge with family and colleagues
• Participate in security awareness training
• Practice identifying phishing in safe environments

Remember: When in doubt, reach out through official channels!`;
    }

    if (lowerInput.includes('urgent') || lowerInput.includes('pressure')) {
      return `**Understanding Urgency Tactics:**

Scammers create artificial urgency to bypass your rational thinking. This message uses pressure tactics like:
• "Act now or lose access"
• "Your account will be closed"
• "Unusual activity detected"
• "Limited time offer"
• "Immediate action required"

**Why They Use This:**
• Forces quick decisions without verification
• Triggers fear and panic
• Prevents you from contacting legitimate sources
• Exploits your concern for account security

**Counter Strategy:**
• Slow down - legitimate companies give reasonable timeframes
• Contact the company directly using official channels
• Legitimate urgent issues come through official apps/portals
• Account issues are rarely resolved only via email/SMS

Take your time. Real emergencies don't come via suspicious messages.`;
    }

    if (lowerInput.includes('domain') || lowerInput.includes('spelling')) {
      if (result.analysis.misspelledDomains && result.analysis.misspelledDomains.length > 0) {
        return `**Misspelled Domain Analysis:**

Detected suspicious domains: ${result.analysis.misspelledDomains.join(', ')}

**Common Typosquatting Techniques:**
• Letter substitution: micros0ft.com (0 instead of o)
• Added characters: microsoft-security.com
• Similar characters: paypa1.com (1 instead of l)
• Wrong TLD: microsoft.net instead of .com
• Homoglyphs: using characters that look similar

**How to Spot Fake Domains:**
1. Read the URL character by character
2. Check the primary domain (part before .com/.net)
3. Be wary of extra subdomains
4. Legitimate companies use consistent domains
5. When in doubt, type the official address manually

Never trust links in suspicious messages!`;
      }
    }

    if (lowerInput.includes('thank')) {
      return `You're welcome! Stay safe online. Remember: when something seems suspicious, trust your instincts and verify through official channels. Feel free to ask if you have more questions about cybersecurity!`;
    }

    return `I'm here to help you understand this threat and stay safe online. You can ask me about:

• What actions you should take
• How to report this phishing attempt
• Why specific elements are suspicious
• How to protect yourself in the future
• What to do if you've already clicked a link
• How to verify legitimate communications

What would you like to know more about?`;
  };

  const handleSend = async () => {
    if (!input.trim() || !detectionResult) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    const userInput = input;
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const aiResponse = await generateChatResponse(userInput, detectionResult);
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error('Chat error:', error);
      const fallbackResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateResponse(userInput, detectionResult),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!detectionResult) {
    return (
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border-2 border-slate-200 p-8 text-center">
        <Bot className="h-16 w-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-700 mb-2">AI Assistant Ready</h3>
        <p className="text-slate-600">
          Analyze content above to get personalized security recommendations and guidance.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border-2 border-slate-200 overflow-hidden flex flex-col h-[600px]">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">Security Assistant</h3>
            <p className="text-xs text-blue-100">AI-Powered Guidance</p>
          </div>
        </div>
        <button
          onClick={() => setMessages([])}
          className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          title="Clear chat"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[80%]`}>
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 bg-blue-600 p-2 rounded-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}
              <div
                className={`rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border-2 border-slate-200 text-slate-900'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <p className="text-xs mt-2 opacity-70">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 bg-slate-600 p-2 rounded-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 bg-blue-600 p-2 rounded-lg">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t-2 border-slate-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about the threat, what to do, how to stay safe..."
            className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center justify-center space-x-4 mt-3 text-xs text-slate-500">
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-3 w-3" />
            <span>Safe Actions</span>
          </div>
          <div className="flex items-center space-x-1">
            <AlertTriangle className="h-3 w-3" />
            <span>Warnings</span>
          </div>
          <div className="flex items-center space-x-1">
            <XCircle className="h-3 w-3" />
            <span>What to Avoid</span>
          </div>
        </div>
      </div>
    </div>
  );
}
