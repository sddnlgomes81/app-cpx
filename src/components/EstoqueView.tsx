import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Package, Plus, AlertTriangle, Search, Edit } from 'lucide-react';
import { Product } from '../types';

export const EstoqueView: React.FC = () => {
  const { products, addProduct, updateProduct } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    code: '',
    name: '',
    category: 'Peça' as const,
    costPrice: 0,
    salePrice: 0,
    stockQty: 10,
    minStock: 3,
  });

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-generate code if empty
    let finalCode = productForm.code.trim();
    if (!finalCode) {
      finalCode = `PRD-${Date.now().toString().slice(-6)}`;
    }
    
    const finalForm = { ...productForm, code: finalCode };

    if (editingProduct) {
      updateProduct({ ...editingProduct, ...finalForm });
    } else {
      addProduct(finalForm);
    }
    setProductForm({ code: '', name: '', category: 'Peça', costPrice: 0, salePrice: 0, stockQty: 10, minStock: 3 });
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const openNewModal = () => {
    setEditingProduct(null);
    setProductForm({ code: '', name: '', category: 'Peça', costPrice: 0, salePrice: 0, stockQty: 10, minStock: 3 });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      code: product.code,
      name: product.name,
      category: product.category,
      costPrice: product.costPrice,
      salePrice: product.salePrice,
      stockQty: product.stockQty,
      minStock: product.minStock,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 bg-slate-50 min-h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800">Controle de Estoque & Peças</h2>
          <p className="text-xs text-slate-500">Gerenciamento de peças, suprimentos e alertas automáticos de estoque baixo</p>
        </div>
        <button
          onClick={openNewModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" /> Cadastrar Produto / Peça
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome ou código do produto..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="py-3.5 px-4">Código</th>
                <th className="py-3.5 px-4">Nome do Produto</th>
                <th className="py-3.5 px-4">Categoria</th>
                <th className="py-3.5 px-4 text-right">Preço Custo</th>
                <th className="py-3.5 px-4 text-right">Preço Venda</th>
                <th className="py-3.5 px-4 text-center">Estoque Atual</th>
                <th className="py-3.5 px-4 text-center">Estoque Mínimo</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const isLow = p.stockQty <= p.minStock;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{p.code}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{p.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium text-[11px]">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">R$ {p.costPrice.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">R$ {p.salePrice.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-center font-bold">{p.stockQty} un.</td>
                    <td className="py-3.5 px-4 text-center text-slate-500">{p.minStock} un.</td>
                    <td className="py-3.5 px-4 text-center">
                      {isLow ? (
                        <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 mx-auto w-fit">
                          <AlertTriangle className="w-3 h-3" /> Baixo
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[10px]">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mx-auto"
                        title="Editar Produto"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Novo Produto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="font-bold text-base">{editingProduct ? 'Editar Produto ou Peça' : 'Cadastrar Produto ou Peça'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-blue-700 rounded-lg">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Código</label>
                  <input
                    type="text"
                    value={productForm.code}
                    onChange={(e) => setProductForm({ ...productForm, code: e.target.value })}
                    placeholder="Ex: TON-HP-01 (deixe vazio p/ auto)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Categoria</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="Peça">Peça</option>
                    <option value="Suprimento">Suprimento</option>
                    <option value="Acessório">Acessório</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Nome do Produto / Peça</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Preço de Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.costPrice}
                    onChange={(e) => setProductForm({ ...productForm, costPrice: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Preço de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.salePrice}
                    onChange={(e) => setProductForm({ ...productForm, salePrice: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Quantidade em Estoque</label>
                  <input
                    type="number"
                    value={productForm.stockQty}
                    onChange={(e) => setProductForm({ ...productForm, stockQty: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Estoque Mínimo</label>
                  <input
                    type="number"
                    value={productForm.minStock}
                    onChange={(e) => setProductForm({ ...productForm, minStock: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-xs"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
