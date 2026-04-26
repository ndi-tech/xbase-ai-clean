'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Your Supabase credentials
const supabaseUrl = 'https://yllquiyrnhicvnrhihfk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsbHF1aXlybmhpY3ZucmhpaGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzAxNzAsImV4cCI6MjA5MjUwNjE3MH0.bJI1KBep_S62_cDlST7R7luBU1TirciERIqLBfHLnGk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function DocumentsPage() {
  const [user, setUser] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
      } else {
        setUser(user);
        loadDocuments(user.id);
      }
    };
    checkUser();
  }, []);

  const loadDocuments = async (userId: string) => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setDocuments(data);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('Uploading...');

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const { error } = await supabase.from('documents').insert({
        user_id: user.id,
        filename: file.name,
        content: content.slice(0, 10000)
      });

      if (error) {
        setMessage('❌ Error: ' + error.message);
      } else {
        setMessage('✅ Uploaded successfully!');
        loadDocuments(user.id);
      }
      setUploading(false);
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (!error) {
      loadDocuments(user.id);
      setMessage('🗑️ Document deleted');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-700">🌳 Xbase AI</h1>
          <div className="space-x-6">
            <a href="/dashboard" className="text-gray-600 hover:text-green-600 transition-colors">Dashboard</a>
            <a href="/documents" className="text-green-600 font-semibold border-b-2 border-green-600 pb-1">Documents</a>
            <button 
              onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login'; }}
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Training Documents</h2>
          <p className="text-gray-500 mt-2">Upload your menu, price list, or FAQ. The AI will learn from everything you add.</p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">📄 Upload New Document</h3>
          <div className="border-2 border-dashed border-green-200 rounded-xl p-8 text-center bg-green-50/30 hover:border-green-400 transition-colors">
            <input
              type="file"
              accept=".txt,.csv,.json,.md"
              onChange={handleUpload}
              disabled={uploading}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-3 file:px-6
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-green-600 file:text-white
                hover:file:bg-green-700
                file:cursor-pointer
                cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-3">
              Supported formats: .txt, .csv, .json, .md (Max 10,000 characters)
            </p>
          </div>
          {message && (
            <div className={`mt-4 p-3 rounded-lg text-center ${
              message.includes('✅') ? 'bg-green-50 text-green-700' : 
              message.includes('❌') ? 'bg-red-50 text-red-700' : 
              message.includes('🗑️') ? 'bg-yellow-50 text-yellow-700' :
              'bg-blue-50 text-blue-700'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-gray-800">📚 Your Documents</h3>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              {documents.length} {documents.length === 1 ? 'document' : 'documents'}
            </span>
          </div>
          
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-400">No documents yet</p>
              <p className="text-sm text-gray-400 mt-1">Upload your first menu or FAQ above</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-800">{doc.filename}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(doc.created_at).toLocaleDateString('en-CM')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-400 hover:text-red-600 transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <a href="/dashboard" className="text-green-600 hover:text-green-700 inline-flex items-center gap-2 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}