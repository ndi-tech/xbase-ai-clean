'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yllquiyrnhicvnrhihfk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsbHF1aXlybmhpY3ZucmhpaGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzAxNzAsImV4cCI6MjA5MjUwNjE3MH0.bJI1KBep_S62_cDlST7R7luBU1TirciERIqLBfHLnGk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
      } else {
        setUser(user);
      }
      setLoading(false);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
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
        
        {/* 4-Button Grid - NOW WITH CORRECT LINKS */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Products Card - CLICKABLE LINK */}
          <a href="/products" className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <h3 className="font-semibold mb-3">📦 Products</h3>
            <p className="text-gray-500 text-sm">Add your menu items here</p>
            <div className="mt-3 bg-green-600 text-white px-4 py-2 rounded text-sm inline-block hover:bg-green-700">
              + Add Product
            </div>
          </a>
          
          {/* Documents Card - CLICKABLE LINK */}
          <a href="/documents" className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <h3 className="font-semibold mb-3">📄 Documents</h3>
            <p className="text-gray-500 text-sm">Upload FAQs or training data</p>
            <div className="mt-3 bg-green-600 text-white px-4 py-2 rounded text-sm inline-block hover:bg-green-700">
              + Upload Document
            </div>
          </a>
          
          {/* Orders Card - Coming Soon */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-3">📋 Orders</h3>
            <p className="text-gray-500 text-sm">View customer orders</p>
            <p className="text-xs text-gray-400 mt-3">Coming soon with WhatsApp</p>
          </div>
          
          {/* AI Agent Card - Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-3">🤖 AI Agent</h3>
            <p className="text-gray-500 text-sm">Your WhatsApp agent status</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-green-700 text-sm font-medium">● Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}