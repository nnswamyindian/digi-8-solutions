import { useState, useEffect } from 'react';
import { X, Plus, Package, Edit, Trash2, Check, AlertCircle } from 'lucide-react';
import { Product, getProducts, createProduct, updateProduct, deleteProduct } from '../../../lib/billingApi';

interface ProductsCatalogueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductChanged?: () => void;
}

export default function ProductsCatalogueModal({
  isOpen,
  onClose,
  onProductChanged
}: ProductsCatalogueModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('Software');
  const [description, setDescription] = useState('');
  const [marketPrice, setMarketPrice] = useState<number>(0);
  const [defaultSellingPrice, setDefaultSellingPrice] = useState<number>(0);
  const [taxPercentage, setTaxPercentage] = useState<number>(18);
  const [hsnSac, setHsnSac] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      if (res.success && res.data) {
        setProducts(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setCode(`DIGI8-${Date.now().toString().slice(-4)}`);
    setCategory('Software');
    setDescription('');
    setMarketPrice(10000);
    setDefaultSellingPrice(8000);
    setTaxPercentage(18);
    setHsnSac('998314');
    setUnit('license');
    setShowAddForm(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCode(p.code);
    setCategory(p.category);
    setDescription(p.description || '');
    setMarketPrice(Number(p.market_price));
    setDefaultSellingPrice(Number(p.default_selling_price));
    setTaxPercentage(Number(p.tax_percentage));
    setHsnSac(p.hsn_sac || '');
    setUnit(p.unit || 'pcs');
    setShowAddForm(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!name.trim() || !code.trim()) {
      setErrorMessage('Name and Code/SKU are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        code: code.trim(),
        category,
        description: description.trim(),
        market_price: Number(marketPrice),
        default_selling_price: Number(defaultSellingPrice),
        tax_percentage: Number(taxPercentage),
        hsn_sac: hsnSac.trim(),
        unit
      };

      let res;
      if (editingProduct) {
        res = await updateProduct(editingProduct.id, payload);
      } else {
        res = await createProduct(payload);
      }

      if (res.success) {
        setShowAddForm(false);
        fetchProducts();
        if (onProductChanged) onProductChanged();
      } else {
        setErrorMessage(res.error || 'Failed to save product.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Server error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await deleteProduct(id);
      fetchProducts();
      if (onProductChanged) onProductChanged();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0e1424] border border-white/15 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan">
              <Package size={16} />
            </div>
            <div>
              <h3 className="text-sm font-outfit font-bold text-white">Products & Services Master Catalogue</h3>
              <p className="text-[11px] text-slate-400">Software, hardware components, and service packages available across billing</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!showAddForm && (
              <button
                onClick={handleOpenAdd}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,229,255,0.25)]"
              >
                <Plus size={14} /> Add Product / Service
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 custom-scrollbar text-xs">
          
          {showAddForm ? (
            <form onSubmit={handleSaveProduct} className="p-5 rounded-xl bg-slate-900/60 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h4 className="font-bold text-sm text-white">
                  {editingProduct ? 'Edit Catalogue Item' : 'Add New Product / Service'}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-300 block mb-1">Product / Service Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Digi8 Kirana Software"
                    className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-brand-cyan focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Item Code / SKU *</label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="DIGI8-SW-01"
                    className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:border-brand-cyan focus:outline-none uppercase font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                  >
                    <option value="Software">Software</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Services">Services</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Market Price (₹)</label>
                  <input
                    type="number"
                    value={marketPrice}
                    onChange={e => setMarketPrice(Number(e.target.value))}
                    className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Default Selling Price (₹)</label>
                  <input
                    type="number"
                    value={defaultSellingPrice}
                    onChange={e => setDefaultSellingPrice(Number(e.target.value))}
                    className="w-full bg-[#070b13] border border-brand-cyan/40 rounded-lg px-3 py-2 text-white text-xs font-mono font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Tax Percentage (%)</label>
                  <select
                    value={taxPercentage}
                    onChange={e => setTaxPercentage(Number(e.target.value))}
                    className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">HSN / SAC Code</label>
                  <input
                    type="text"
                    value={hsnSac}
                    onChange={e => setHsnSac(e.target.value)}
                    placeholder="998314 / 847160"
                    className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    placeholder="pcs / license / visit / yr"
                    className="w-full bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-[11px] text-slate-300 block mb-1">Description / Deliverable Scope</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Brief description of the product or service"
                    className="w-full bg-[#070b13] border border-white/10 rounded-lg p-2 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-white/10 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-brand-cyan text-black font-bold text-xs"
                >
                  {isSubmitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          ) : (
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#070b13]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-white/5 text-slate-400 border-b border-white/10">
                    <th className="p-3">Product / Service</th>
                    <th className="p-3">Code / SKU</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-right">Market Price</th>
                    <th className="p-3 text-right">Selling Price</th>
                    <th className="p-3 text-center">Tax %</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-white">{p.name}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{p.description}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-300">{p.code}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 text-[10px]">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-slate-400">
                        ₹{Number(p.market_price).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-brand-cyan">
                        ₹{Number(p.default_selling_price).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-center font-mono text-slate-300">{p.tax_percentage}%</td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all ${
                            p.is_active !== false
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                          }`}
                        >
                          {p.is_active !== false ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-400 hover:text-brand-cyan transition-colors"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-slate-900/60 flex justify-between items-center shrink-0">
          <div className="text-[11px] text-slate-400 font-mono">
            {products.length} Products & Services active in catalogue
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-white/10 text-slate-300 hover:text-white text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
