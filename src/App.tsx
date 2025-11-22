import { useState } from 'react';
import { DetectionType, DetectionResult } from './types';
import Header from './components/Header';
import DetectionTabs from './components/DetectionTabs';
import DetectionInput from './components/DetectionInput';
import AnalysisResults from './components/AnalysisResults';
import ChatBot from './components/ChatBot';
import { analyzeWithGemini } from './utils/geminiDetection';
import { saveDetectionToDatabase } from './utils/supabaseClient';

function App() {
  const [activeTab, setActiveTab] = useState<DetectionType>('url');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);

  const handleAnalyze = async (input: string | File) => {
    setIsAnalyzing(true);
    setDetectionResult(null);

    try {
      const result = await analyzeWithGemini(input, activeTab);
      setDetectionResult(result);

      await saveDetectionToDatabase({
        content: typeof input === 'string' ? input : input.name,
        detectionType: activeTab,
        threatLevel: result.threatLevel,
        confidence: result.confidence,
        redFlags: result.redFlags,
        analysis: result.analysis,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze content. Please check your Gemini API key in the .env file.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(https://media.gettyimages.com/id/2177292181/photo/caution-sign-data-unlocking-hackers.jpg?s=612x612&w=0&k=20&c=AeK-36A9WtP4rIaNDoDJoRvgYx0aFOpbf3cC8_uCQxY=)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      />
      <div className="relative z-10">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border-2 border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Detect Phishing Threats with AI
          </h2>
          <p className="text-slate-700">
            Analyze URLs, emails, SMS messages, and files for potential security threats
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border-2 border-slate-200 p-6">
              <DetectionTabs activeTab={activeTab} onTabChange={setActiveTab} />

              <div className="mt-6">
                <DetectionInput
                  type={activeTab}
                  onAnalyze={handleAnalyze}
                  isAnalyzing={isAnalyzing}
                />
              </div>
            </div>

            {detectionResult && (
              <AnalysisResults result={detectionResult} />
            )}

            {isAnalyzing && (
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border-2 border-slate-200 p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <div className="h-16 w-16 border-4 border-blue-200 rounded-full"></div>
                    <div className="h-16 w-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-slate-900">Analyzing Content</p>
                    <p className="text-sm text-slate-600 mt-1">
                      Running ML-powered threat detection...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-8 h-fit">
            <ChatBot detectionResult={detectionResult} />
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200 p-6">
            <div className="bg-blue-100 rounded-lg p-3 w-fit mb-4">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">AI-Powered Detection</h3>
            <p className="text-sm text-slate-600">
              Advanced machine learning algorithms analyze content patterns, URLs, and language to identify threats
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200 p-6">
            <div className="bg-emerald-100 rounded-lg p-3 w-fit mb-4">
              <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Intelligent Assistant</h3>
            <p className="text-sm text-slate-600">
              Get personalized explanations and actionable recommendations for every threat detected
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200 p-6">
            <div className="bg-orange-100 rounded-lg p-3 w-fit mb-4">
              <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Cyber Awareness Education</h3>
            <p className="text-sm text-slate-600">
              Learn to identify threats and develop skills to protect yourself from future phishing attempts
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900/95 backdrop-blur-sm text-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400 text-sm">
            PhishGuard AI - Protecting users from phishing threats with advanced AI technology
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Educational tool for cybersecurity awareness
          </p>
        </div>
      </footer>
      </div>
    </div>
  );
}

export default App;
