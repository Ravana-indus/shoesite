import React, { useEffect, useState, useRef } from 'react';
import { api } from '../../../lib/api';
import { supabase } from '../../../lib/supabase';
import { useOrderContext } from '../../../context/OrderContext';
import { Icon } from '../../ui/Icon';
import type { OrderItem, OrderEditType, Product, ProductVariant } from '../../../types/database';
import { formatPriceCents } from '../../../types/database';

interface OrderEditModalProps {
  orderId: string;
  items: OrderItem[];
  onClose: () => void;
  onSave: () => void;
}

interface EditRecord {
  edit_type: OrderEditType;
  order_item_id?: string;
  before_data: Record<string, unknown>;
  after_data: Record<string, unknown>;
  product_id?: string;
  product_name?: string;
  variant_id?: string;
  variant_name?: string;
  unit_price_cents?: number;
  quantity?: number;
}

interface LocalItem {
  id: string;
  product_id: string;
  product_name: string;
  variant_id: string | null;
  variant_name: string | null;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
  _isNew?: boolean;
  _removed?: boolean;
}

type AdminProduct = Product & {
  brand: unknown;
  category: unknown;
  images: unknown[];
};

export function OrderEditModal({ orderId, items, onClose, onSave }: OrderEditModalProps) {
  const { triggerRefresh } = useOrderContext();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [localItems, setLocalItems] = useState<LocalItem[]>(() =>
    items.map(item => ({ ...item }))
  );
  const [edits, setEdits] = useState<EditRecord[]>([]);
  const [saving, setSaving] = useState(false);

  const [productSearch, setProductSearch] = useState('');
  const [allProducts, setAllProducts] = useState<AdminProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<AdminProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [addQuantity, setAddQuantity] = useState(1);
  const [addUnitPrice, setAddUnitPrice] = useState(0);

  useEffect(() => {
    dialogRef.current?.showModal();
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const products = await api.products.getAllAdmin();
      setAllProducts(products as AdminProduct[]);
    } catch (e) {
      console.error('Failed to load products', e);
    }
  }

  useEffect(() => {
    if (!productSearch.trim()) {
      setFilteredProducts([]);
      return;
    }
    const q = productSearch.toLowerCase();
    setFilteredProducts(
      allProducts.filter(p => p.name.toLowerCase().includes(q)).slice(0, 10)
    );
  }, [productSearch, allProducts]);

  useEffect(() => {
    if (selectedProduct) {
      fetchVariants(selectedProduct.id);
    } else {
      setProductVariants([]);
      setSelectedVariant(null);
    }
  }, [selectedProduct]);

  async function fetchVariants(productId: string) {
    try {
      const { data } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true);
      setProductVariants(data ?? []);
    } catch (e) {
      console.error('Failed to load variants', e);
      setProductVariants([]);
    }
  }

  function handleProductSelect(product: AdminProduct) {
    setSelectedProduct(product);
    setSelectedVariant(null);
    setAddUnitPrice(product.price_cents);
    setProductSearch(product.name);
    setFilteredProducts([]);
  }

  function handleAddItem() {
    if (!selectedProduct) return;
    const tempId = `new_${Date.now()}`;
    const variantName = selectedVariant?.name ?? null;
    const newItem: LocalItem = {
      id: tempId,
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      variant_id: selectedVariant?.id ?? null,
      variant_name: variantName,
      quantity: addQuantity,
      unit_price_cents: addUnitPrice,
      total_cents: addUnitPrice * addQuantity,
      _isNew: true,
    };
    setLocalItems(prev => [...prev, newItem]);
    setEdits(prev => [
      ...prev,
      {
        edit_type: 'add_item',
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        variant_id: selectedVariant?.id ?? undefined,
        variant_name: variantName ?? undefined,
        quantity: addQuantity,
        unit_price_cents: addUnitPrice,
        before_data: {},
        after_data: {
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          variant_id: selectedVariant?.id ?? null,
          variant_name: variantName,
          quantity: addQuantity,
          unit_price_cents: addUnitPrice,
        },
      },
    ]);
    setSelectedProduct(null);
    setSelectedVariant(null);
    setProductSearch('');
    setAddQuantity(1);
    setAddUnitPrice(0);
  }

  function handleRemoveItem(localId: string) {
    setLocalItems(prev =>
      prev.map(item =>
        item.id === localId ? { ...item, _removed: true } : item
      )
    );
    const item = localItems.find(i => i.id === localId);
    if (!item) return;
    if (item._isNew) {
      setEdits(prev => prev.filter(e => !(e.product_id === item.product_id && e._tempId === localId)));
    } else {
      setEdits(prev => [
        ...prev,
        {
          edit_type: 'remove_item',
          order_item_id: item.id,
          before_data: {
            product_id: item.product_id,
            product_name: item.product_name,
            variant_id: item.variant_id,
            variant_name: item.variant_name,
            quantity: item.quantity,
            unit_price_cents: item.unit_price_cents,
          },
          after_data: { removed: true },
        },
      ]);
    }
  }

  function handleQuantityChange(localId: string, newQty: number) {
    if (newQty < 1) return;
    setLocalItems(prev =>
      prev.map(item =>
        item.id === localId
          ? { ...item, quantity: newQty, total_cents: item.unit_price_cents * newQty }
          : item
      )
    );
    const item = localItems.find(i => i.id === localId);
    if (!item || item._isNew || item._removed) return;
    setEdits(prev => {
      const existing = prev.find(
        e => e.order_item_id === localId && e.edit_type === 'change_quantity'
      );
      if (existing) {
        return prev.map(e =>
          e === existing ? { ...e, quantity: newQty, after_data: { ...e.after_data, quantity: newQty } } : e
        );
      }
      return [
        ...prev,
        {
          edit_type: 'change_quantity',
          order_item_id: localId,
          before_data: {
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
          },
          after_data: {
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: newQty,
          },
          quantity: newQty,
        },
      ];
    });
  }

  function handlePriceChange(localId: string, newPrice: number) {
    setLocalItems(prev =>
      prev.map(item =>
        item.id === localId
          ? { ...item, unit_price_cents: newPrice, total_cents: newPrice * item.quantity }
          : item
      )
    );
    const item = localItems.find(i => i.id === localId);
    if (!item || item._isNew || item._removed) return;
    setEdits(prev => {
      const existing = prev.find(
        e => e.order_item_id === localId && e.edit_type === 'change_price'
      );
      if (existing) {
        return prev.map(e =>
          e === existing
            ? { ...e, unit_price_cents: newPrice, after_data: { ...e.after_data, unit_price_cents: newPrice } }
            : e
        );
      }
      return [
        ...prev,
        {
          edit_type: 'change_price',
          order_item_id: localId,
          before_data: {
            product_id: item.product_id,
            product_name: item.product_name,
            unit_price_cents: item.unit_price_cents,
          },
          after_data: {
            product_id: item.product_id,
            product_name: item.product_name,
            unit_price_cents: newPrice,
          },
          unit_price_cents: newPrice,
        },
      ];
    });
  }

  function getSubtotal() {
    return localItems
      .filter(item => !item._removed)
      .reduce((sum, item) => sum + item.total_cents, 0);
  }

  function getNewTotal() {
    const subtotal = getSubtotal();
    const shipping = items.reduce((s, i) => s + (i.total_cents || 0), 0) - items.reduce((s, i) => s + i.total_cents, 0);
    const originalSubtotal = items.reduce((s, i) => s + i.total_cents, 0);
    const originalShipping = 0;
    return subtotal;
  }

  async function handleSave() {
    setSaving(true);
    try {
      const cleanEdits = edits.map(e => ({ ...e }));
      if (cleanEdits.length > 0) {
        await api.orderEdits.apply(orderId, { edits: cleanEdits });
      }
      triggerRefresh();
      onSave();
      onClose();
    } catch (e) {
      console.error('Failed to apply order edits', e);
    } finally {
      setSaving(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === dialogRef.current) onClose();
  }

  function handleClose() {
    dialogRef.current?.close();
    onClose();
  }

  const activeItems = localItems.filter(item => !item._removed);

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={handleBackdropClick}
      className="fixed inset-0 m-auto max-w-3xl w-[95vw] max-h-[90vh] bg-surface rounded-2xl border border-outline-variant/10 shadow-2xl backdrop:bg-black/50 overflow-hidden"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
          <h2 className="text-xl font-noto-serif text-primary">Edit Order Items</h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant transition-colors"
          >
            <Icon name="close" className="text-lg" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-on-surface mb-3">Current Items</h3>
            {activeItems.length === 0 ? (
              <p className="text-on-surface-variant text-sm py-4 text-center">No items</p>
            ) : (
              <div className="space-y-3">
                {activeItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-on-surface truncate">{item.product_name}</p>
                      {item.variant_name && (
                        <p className="text-xs text-on-surface-variant">{item.variant_name}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded bg-surface-container-high hover:bg-surface-container-high/80 text-on-surface-variant transition-colors"
                      >
                        <Icon name="remove" className="text-sm" />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={e => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                        className="w-12 h-7 text-center text-sm bg-surface-container-high rounded border-0 text-on-surface focus:ring-1 focus:ring-primary"
                        min="1"
                      />
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded bg-surface-container-high hover:bg-surface-container-high/80 text-on-surface-variant transition-colors"
                      >
                        <Icon name="add" className="text-sm" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-xs text-on-surface-variant">LKR</span>
                      <input
                        type="number"
                        value={item.unit_price_cents}
                        onChange={e => handlePriceChange(item.id, parseInt(e.target.value) || 0)}
                        className="w-20 h-7 text-sm text-right px-2 bg-surface-container-high rounded border-0 text-on-surface focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <p className="w-20 text-sm text-right font-medium text-on-surface">
                      {formatPriceCents(item.total_cents)}
                    </p>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 rounded hover:bg-error-container text-error transition-colors"
                    >
                      <Icon name="delete" className="text-sm" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-outline-variant/10 pt-6">
            <h3 className="text-sm font-medium text-on-surface mb-3">Add Item</h3>
            <div className="space-y-3 p-4 bg-surface-container-low rounded-lg">
              <div>
                <label className="block text-xs text-on-surface-variant mb-1">Product</label>
                <div className="relative">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={e => {
                      setProductSearch(e.target.value);
                      setSelectedProduct(null);
                    }}
                    placeholder="Search products..."
                    className="w-full h-9 px-3 text-sm bg-surface-container-high rounded border-0 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-1 focus:ring-primary"
                  />
                  {filteredProducts.length > 0 && !selectedProduct && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-high rounded-lg shadow-lg border border-outline-variant/10 z-10 max-h-48 overflow-y-auto">
                      {filteredProducts.map(product => (
                        <button
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-surface-container-low transition-colors text-on-surface"
                        >
                          {product.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {productVariants.length > 0 && (
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1">Variant</label>
                  <select
                    value={selectedVariant?.id ?? ''}
                    onChange={e => {
                      const v = productVariants.find(v => v.id === e.target.value);
                      setSelectedVariant(v ?? null);
                      if (v) setAddUnitPrice(v.price_cents);
                    }}
                    className="w-full h-9 px-3 text-sm bg-surface-container-high rounded border-0 text-on-surface focus:ring-1 focus:ring-primary"
                  >
                    <option value="">No variant</option>
                    {productVariants.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} — {formatPriceCents(v.price_cents)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1">Quantity</label>
                  <input
                    type="number"
                    value={addQuantity}
                    onChange={e => setAddQuantity(parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full h-9 px-3 text-sm bg-surface-container-high rounded border-0 text-on-surface focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1">Unit Price (cents)</label>
                  <input
                    type="number"
                    value={addUnitPrice}
                    onChange={e => setAddUnitPrice(parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full h-9 px-3 text-sm bg-surface-container-high rounded border-0 text-on-surface focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                onClick={handleAddItem}
                disabled={!selectedProduct}
                className="w-full h-9 flex items-center justify-center gap-2 bg-primary text-on-primary rounded font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="add" className="text-sm" />
                Add Item
              </button>
            </div>
          </div>

          <div className="border-t border-outline-variant/10 pt-6">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-on-surface-variant">New Subtotal</span>
              <span className="text-lg font-medium text-on-surface">{formatPriceCents(getSubtotal())}</span>
            </div>
            <p className="text-xs text-on-surface-variant text-right">
              Shipping and discounts unchanged — will recalculate on save
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-outline-variant/10 bg-surface">
          <button
            onClick={handleSave}
            disabled={saving || edits.length === 0}
            className="w-full h-11 flex items-center justify-center gap-2 bg-primary text-on-primary rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Icon name="progress_activity" className="text-sm animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Icon name="check" className="text-sm" />
                Save Changes ({edits.length})
              </>
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}
