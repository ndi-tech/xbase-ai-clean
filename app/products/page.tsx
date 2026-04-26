'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yllquiyrnhicvnrhihfk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsbHF1aXlybmhpY3ZucmhpaGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzAxNzAsImV4cCI6MjA5MjUwNjE3MH0.bJI1KBep_S62_cDlST7R7luBU1TirciERIqLBfHLnGk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ProductsPage() {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) window.location.href = '/login';
      else {
        setUser(user);
        loadProducts(user.id);
      }
    });
  }, []);

  const loadProducts = async (userId: string) => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId);
    if (data) setProducts(data);
  };

  const addProduct = async () => {
    if (!name || !price) return;
    const { error } = await supabase.from('products').insert({
      user_id: user.id,
      name: name,
      price: parseInt(price)
    });
    if (!error) {
      setName('');
      setPrice('');
      setShowForm(false);
      loadProducts(user.id);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-green-600">🌳 Xbase AI</h1>
          <div className="space-x-4">
            <a href="/dashboard" className="text-gray-600 hover:text-green-600">Dashboard</a>
            <a href="/products" className="text-green-600 font-semibold">Products</a>
            <a href="/documents" className="text-gray-600 hover:text-green-600">Documents</a>
            <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login'; }} className="text-gray-600 hover:text-red-600">Logout</button>
          </div>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">📦 Products</h2>
          <button onClick={() => setShowForm(!showForm)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">+ Add Product</button>
        </div>
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <input type="text" placeholder="Product name (e.g., Chicken)" className="w-full p-2 border rounded mb-2" value={name} onChange={(e) => setName(e.target.value)} />
            <input type="number" placeholder="Price in FCFA" className="w-full p-2 border rounded mb-2" value={price} onChange={(e) => setPrice(e.target.value)} />
            <button onClick={addProduct} className="bg-green-600 text-white px-4 py-2 rounded">Save Product</button>
          </div>
        )}
        <div className="bg-white rounded-lg shadow">
          {products.length === 0 ? <p className="p-6 text-gray-500 text-center">No products yet. Add your first menu item above.</p> : products.map((p) => <div key={p.id} className="border-b p-4 flex justify-between"><span>{p.name}</span><span className="font-semibold">{p.price.toLocaleString()} FCFA</span></div>)}
        </div>
        <p className="mt-4 text-center"><a href="/dashboard" className="text-green-600">← Back to Dashboard</a></p>
      </div>
    </div>
  );
}