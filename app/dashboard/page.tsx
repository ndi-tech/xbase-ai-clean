'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yllquiyrnhicvnrhihfk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsbHF1aXlybmhpY3ZucmhpaGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzAxNzAsImV4cCI6MjA5MjUwNjE3MH0.bJI1KBep_S62_cDlST7R7luBU1TirciERIqLBfHLnGk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
      } else {
        setUser(user);
        // Load documents for AI context
        const { data: docs } = await supabase
          .from('documents')
          .select('content')
          .eq('user_id', user.id);
        setDocuments(docs || []);
      }
      setLoading(false);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const askAI = async () => {
    if (!question.trim()) return;
    
    setChatLoading(true);
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
              content: `You are Xbase AI. Answer using ONLY this information: ${context || 'No documents yet.'} Be friendly.`
            },
            { role: 'user', content: question }
          ],
          max_tokens: 500
        })
      });
      
      const data = await response.json();
      setAnswer(data.choices?.[0]?.message?.content || 'No response');
      
    } catch (err) {
      const error = err as Error;
      setAnswer('Error: ' + error.message);
    }
    
    setChatLoading(false);
    setQuestion('');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-green-600">🌳 Xbase AI</h1>
          <div className="space-x-4">
            <a href="/dashboard" className="text-green-600 font-semibold">Dashboard</a>
            <a href="/products" className="text-gray-600 hover:text-green-600">Products</a>
            <a href="/documents" className="text-gray-600 hover:text-green-600">Documents</a>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      <div className="max-w-6xl mx-auto p-6">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Welcome, {user?.email}</h2>
          <p className="text-gray-600">Your AI agent dashboard is ready.</p>
        </div>
        
        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Management Cards */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Products Card */}
              <a href="/products" className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-3">📦 Products</h3>
                <p className="text-gray-500 text-sm">Add your menu items here</p>
                <div className="mt-3 bg-green-600 text-white px-4 py-2 rounded text-sm inline-block hover:bg-green-700">
                  + Add Product
                </div>
              </a>
              
              {/* Documents Card */}
              <a href="/documents" className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-3">📄 Documents</h3>
                <p className="text-gray-500 text-sm">Upload FAQs or training data</p>
                <div className="mt-3 bg-green-600 text-white px-4 py-2 rounded text-sm inline-block hover:bg-green-700">
                  + Upload Document
                </div>
              </a>
              
              {/* Orders Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold mb-3">📋 Orders</h3>
                <p className="text-gray-500 text-sm">View customer orders</p>
                <p className="text-xs text-gray-400 mt-3">Coming soon with WhatsApp</p>
              </div>
            </div>
          </div>
          
          {/* Right Column - AI Chat Interface */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-green-600 px-6 py-4">
              <h3 className="text-white font-semibold text-lg">🤖 Test Your AI Agent</h3>
              <p className="text-green-100 text-sm">Ask questions about your menu and documents</p>
            </div>
            
            <div className="p-6">
              {/* Chat Display Area */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 min-h-[250px] max-h-[350px] overflow-y-auto">
                {answer ? (
                  <div className="prose prose-sm max-w-none">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 text-sm">🤖</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-700 mb-1">AI Agent:</p>
                        <p className="text-gray-600 whitespace-pre-wrap">{answer}</p>
                      </div>
                    </div>
                  </div>
                ) : chatLoading ? (
                  <div className="flex items-center justify-center h-full min-h-[200px]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
                      <p className="text-gray-400">AI is thinking...</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[200px]">
                    <div className="text-center">
                      <div className="text-4xl mb-3">💬</div>
                      <p className="text-gray-400">Ask a question about your menu</p>
                      <p className="text-gray-400 text-sm mt-1">Example: "What's on your menu?"</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Document Status */}
              <div className="mb-4">
                {documents.length === 0 ? (
                  <p className="text-yellow-600 text-sm text-center">⚠️ No documents uploaded. <a href="/documents" className="underline">Upload a menu</a> first.</p>
                ) : (
                  <p className="text-green-600 text-sm text-center">✅ {documents.length} document(s) loaded for AI</p>
                )}
              </div>
              
              {/* Input Area */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && askAI()}
                  placeholder={documents.length === 0 ? "Upload documents first..." : "What's on your menu?"}
                  disabled={documents.length === 0 || chatLoading}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 disabled:bg-gray-100"
                />
                <button
                  onClick={askAI}
                  disabled={documents.length === 0 || chatLoading || !question.trim()}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {chatLoading ? '...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
