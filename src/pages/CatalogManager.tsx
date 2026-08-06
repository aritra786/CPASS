import React, { useState } from 'react';
import { ShoppingBag, Plus, Tag, Trash2, CheckCircle2 } from 'lucide-react';

export const CatalogManager: React.FC = () => {
  const [products, setProducts] = useState([
    { id: 'p1', sku: 'CNX-SHOE-01', title: 'Ultra Air Running Sneakers', price: 120.00, category: 'Footwear', inStock: true, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80' },
    { id: 'p2', sku: 'CNX-WATCH-88', title: 'Smart Fitness Tracker Watch', price: 199.99, category: 'Electronics', inStock: true, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80' },
    { id: 'p3', sku: 'CNX-BAG-09', title: 'Waterproof Travel Backpack', price: 79.50, category: 'Accessories', inStock: false, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80' }
  ]);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) return;
    setProducts(prev => [
      {
        id: `p_${Date.now()}`,
        sku: sku || `SKU-${Math.floor(100 + Math.random() * 900)}`,
        title,
        price: parseFloat(price),
        category: 'General',
        inStock: true,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'
      },
      ...prev
    ]);
    setTitle('');
    setPrice('');
    setSku('');
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          WhatsApp & RCS Product Catalog Manager
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage interactive e-commerce product carousels for native in-chat cart checkout
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Add Product Form */}
        <form onSubmit={handleAddProduct} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShoppingBag className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Add New Catalog Item</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Product Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              placeholder="e.g. Wireless Noise-Canceling Headphones"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">SKU Code</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                placeholder="SKU-101"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Price ($ USD)</label>
              <input
                type="number"
                required
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono font-bold"
                placeholder="49.99"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Product Catalog</span>
          </button>
        </form>

        {/* Products Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between p-4">
              <div className="flex gap-3">
                <img src={p.image} alt={p.title} className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">{p.sku}</span>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{p.title}</h4>
                  <div className="text-blue-700 font-extrabold text-sm mt-1">${(p.price ?? 0).toFixed(2)}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-3 flex justify-between items-center text-xs">
                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                  p.inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {p.inStock ? 'In Stock' : 'Out of Stock'}
                </span>

                <button
                  onClick={() => setProducts(prev => prev.filter(item => item.id !== p.id))}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
