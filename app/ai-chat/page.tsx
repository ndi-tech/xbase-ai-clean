'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yllquiyrnhicvnrhihfk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsbHF1aXlybmhpY3ZucmhpaGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzAxNzAsImV4cCI6MjA5MjUwNjE3MH0.bJI1KBep_S62_cDlST7R7luBU1TirciERIqLBfHLnGk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AIChatPage() {
  const [user, setUser] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }
      setUser(user);
      
      const { data: docs } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id);
      setDocuments(docs || []);
    };
    init();
  }, []);

  const askQuestion = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    setAnswer('');
    
    const context = documents.map(doc => doc.content).join('\n\n');
    
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are Xbase AI. Answer using ONLY this: ${context || 'No documents yet.'} Be friendly.`
            },
            { role: 'user', content: question }
          ],
          max_tokens: 500
        })
      });
      
      const data = await response.json();
      setAnswer(data.choices?.[0]?.message?.content || 'No response');
      
    } catch (error) {
      setAnswer('Error: ' + error.message);
    }
    
    setLoading(false);
    setQuestion('');
  };

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-green-700 text-center mb-2">🌳 Xbase AI</h1>
          <p className="text-gray-500 text-center mb-6">Test Your AI Agent</p>
          
          {documents.length === 0 && (
            <p className="text-yellow-600 text-sm text-center mb-4">⚠️ Upload a menu in Documents page first</p>
          )}
          
          <div className="bg-gray-100 rounded-xl p-4 mb-4 min-h-[200px] whitespace-pre-wrap">
            {loading ? <div className="text-center text-gray-500">Thinking...</div> : answer || <div className="text-center text-gray-400">Ask a question about your menu...</div>}
          </div>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
              placeholder="What's on your menu?"
              className="flex-1 p-3 border rounded-lg"
            />
            <button onClick={askQuestion} className="bg-green-600 text-white px-6 py-3 rounded-lg">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
