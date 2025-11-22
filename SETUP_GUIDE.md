# PhishGuard AI - Setup Guide

## Quick Start

Your PhishGuard AI application is now fully integrated with Google Gemini AI and Supabase database. Follow these steps to get started:

## 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

## 2. Configure Environment Variables

Open the `.env` file in your project root and replace the placeholder with your actual Gemini API key:

```bash
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
```

The Supabase credentials are already configured and ready to use.

## 3. Install Dependencies

If not already done, install all dependencies:

```bash
npm install --include=dev
```

## 4. Run the Application

Start the development server:

```bash
npm run dev
```

The application will open at `http://localhost:5173`

## 5. Test the ML-Powered Detection

Try analyzing these sample phishing examples:

### Example 1: Malicious Email
```
URGENT: Your PayPal account has been suspended!

Click here immediately to verify your account: http://paypa1.com/verify

Your account will be permanently closed within 24 hours if you don't act now.

Do not reply to this email. Click the link above to restore access.
```

### Example 2: Suspicious SMS
```
ALERT: Unusual activity detected on your bank account.
Verify now at: bit.ly/bank-verify-2024 or your account will be locked.
```

### Example 3: Safe URL
```
https://www.google.com
```

## Features Implemented

### 1. ML-Powered Detection (Gemini AI)
- Real-time phishing analysis using Google's Gemini Pro model
- Analyzes URLs, emails, SMS messages, and files
- Provides threat levels: Safe, Suspicious, or Malicious
- Confidence scoring (70-95%)
- Detailed red flag identification

### 2. Intelligent Chatbot Assistant
- AI-powered responses using Gemini
- Explains why content was flagged
- Highlights specific dangers:
  - Spoofed domains (e.g., micros0ft.com)
  - Urgent language and pressure tactics
  - Fake sender addresses
  - Social engineering attempts
- Provides actionable suggestions:
  - Delete the message
  - Don't click links or download attachments
  - Don't reply or forward
  - Report to authorities
- Teaches cyber-awareness for future prevention
- Step-by-step remediation guidance

### 3. Detection Analysis
The AI examines multiple factors:
- **Sender Verification**: Detects spoofed email addresses
- **Link Analysis**: Identifies suspicious URLs, shortened links, IP addresses
- **Domain Checking**: Finds typosquatting (paypa1.com, micros0ft.com)
- **Language Patterns**: Detects urgent language and pressure tactics
- **Social Engineering**: Identifies manipulation attempts
- **Attachment Risk**: Assesses file dangers

### 4. Supabase Database Integration
- Stores all detection results for historical analysis
- Tracks threat levels and patterns
- Enables future ML model improvements
- Provides analytics capabilities

### 5. Multi-Channel Support
- URL scanning
- Email content analysis
- SMS/text message detection
- File attachment scanning

## How the Chatbot Works

After analyzing content, the chatbot provides:

1. **Initial Analysis**: Automatically explains the detection results
2. **Interactive Q&A**: Ask specific questions like:
   - "What should I do?"
   - "How do I report this?"
   - "Why is this dangerous?"
   - "How can I protect myself?"
3. **Educational Content**: Learn about phishing tactics and prevention
4. **Actionable Steps**: Get clear instructions for responding safely

### Example Chatbot Interactions

**User**: "What should I do?"

**Assistant**: Provides immediate actions like:
- DELETE the message immediately
- DO NOT click any links
- DO NOT download attachments
- DO NOT reply or forward
- REPORT the phishing attempt
- Additional protection steps

**User**: "How do I report this?"

**Assistant**: Provides platform-specific reporting instructions for Gmail, Outlook, SMS, and official agencies like FTC and FBI.

## Database Schema

The application uses a `detections` table with:
- `id`: Unique identifier
- `content`: Analyzed content
- `detection_type`: url, email, sms, or file
- `threat_level`: safe, suspicious, or malicious
- `confidence`: 0-100 score
- `red_flags`: JSON array of identified issues
- `analysis`: Detailed findings object
- `created_at`: Timestamp

## Security Features

- Row Level Security (RLS) enabled on database
- No authentication required for basic usage
- Gemini API key secured in environment variables
- All detection history stored securely in Supabase

## Building for Production

Build the optimized production bundle:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Troubleshooting

### API Key Issues
If you see "Failed to analyze content":
1. Check your `.env` file has the correct Gemini API key
2. Ensure the key starts with `AIza`
3. Verify the key is active in Google AI Studio
4. Restart the dev server after changing `.env`

### Database Errors
The Supabase connection is pre-configured. If you see database errors:
1. Check your internet connection
2. Verify the `.env` file has valid Supabase credentials

### Build Errors
If the build fails:
```bash
npm install --include=dev
npm run build
```

## Next Steps

1. Add your Gemini API key to `.env`
2. Test with sample phishing examples
3. Explore the chatbot's educational features
4. Share with others to raise cybersecurity awareness

## Support

For issues or questions:
- Check the main README.md
- Review the code documentation
- Open an issue on GitHub

---

**Stay Safe Online!**
