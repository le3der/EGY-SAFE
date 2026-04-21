import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Bot, Sparkles, Loader2, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface GeminiThreatSummaryProps {
  threatDetails: string;
}

export default function GeminiThreatSummary({ threatDetails }: GeminiThreatSummaryProps) {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { lang, t } = useLanguage();

  useEffect(() => {
    let isMounted = true;
    
    async function summarizeWithGemini() {
      try {
        setLoading(true);
        setError(null);
        
        // Use Gemini API from environment variable
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
           throw new Error("Gemini API key is not configured.");
        }

        const ai = new GoogleGenAI({ apiKey });
        
        const prompt = `You are an elite cybersecurity analyst. 
Summarize the following threat indicators and logs into a single, highly concise, and urgent sentence. 
Focus only on the 'what', 'who' (if known), and 'impact'.
Language to use: ${lang === 'ar' ? 'Arabic' : 'English'}.

Threat Data:
${threatDetails}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        if (isMounted) {
          setSummary(response.text || t("لا يوجد ملخص متاح.", "No summary available."));
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Gemini AI Error:", err);
        if (isMounted) {
          setError(t('فشل الذكاء الاصطناعي في جلب الملخص.', 'AI failed to generate summary.'));
          setLoading(false);
        }
      }
    }

    if (threatDetails) {
      summarizeWithGemini();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [threatDetails, lang]);

  return (
    <div className="bg-[#111] dark:bg-white/5 border border-cyan/30 rounded-xl p-4 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/10 rounded-full blur-3xl group-hover:bg-cyan/20 transition-all"></div>
      
      <div className="flex gap-3 relative z-10">
        <div className="flex-shrink-0 mt-1">
           <div className="w-8 h-8 rounded-lg bg-cyan/10 flex items-center justify-center border border-cyan/30">
               {loading ? (
                   <Loader2 className="w-4 h-4 text-cyan animate-spin" />
               ) : error ? (
                   <ShieldAlert className="w-4 h-4 text-red-500" />
               ) : (
                   <Sparkles className="w-4 h-4 text-cyan" />
               )}
           </div>
        </div>
        <div>
           <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
               {t('ملخص الذكاء الاصطناعي', 'AI-Powered Summary')}
               <span className="text-[9px] bg-cyan/20 text-cyan px-1.5 py-0.5 rounded border border-cyan/30 font-mono tracking-widest">GEMINI</span>
           </h4>
           {loading ? (
               <div className="space-y-2 mt-2">
                   <div className="h-3 bg-white/10 rounded w-full animate-pulse"></div>
                   <div className="h-3 bg-white/10 rounded w-3/4 animate-pulse"></div>
               </div>
           ) : error ? (
               <p className="text-xs text-red-400 font-medium">{error}</p>
           ) : (
               <p className="text-sm text-neutral-300 leading-relaxed font-mono">
                 {summary}
               </p>
           )}
        </div>
      </div>
    </div>
  );
}
