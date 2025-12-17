import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check } from 'lucide-react';

export default function ItemEditor({ items, onUpdateItems, taxRate, setTaxRate, serviceRate, setServiceRate, onNext }) {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', price: '' });

    const startEdit = (item) => {
        setEditingId(item.id);
        setEditForm({ name: item.name, price: item.price });
    };

    const saveEdit = (id) => {
        onUpdateItems(items.map(i =>
            i.id === id ? { ...i, name: editForm.name, price: parseFloat(editForm.price) || 0 } : i
        ));
        setEditingId(null);
    };

    const removeItem = (id) => {
        onUpdateItems(items.filter(i => i.id !== id));
    };

    const addItem = () => {
        const newItem = {
            id: `manual-${Date.now()}`,
            name: 'New Item',
            price: 0,
            quantity: 1
        };
        onUpdateItems([...items, newItem]);
        startEdit(newItem);
    };

    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const taxAmount = subtotal * (taxRate / 100);
    const serviceAmount = subtotal * (serviceRate / 100);
    const grandTotal = subtotal + taxAmount + serviceAmount;

    return (
        <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', height: '80vh' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Verify Items</h2>
                <button className="btn-secondary" onClick={addItem}><Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Item</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {items.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                        No items found. Add some manually!
                    </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {items.map(item => (
                        <div key={item.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '12px'
                        }}>
                            {editingId === item.id ? (
                                <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        style={{ flex: 1 }}
                                        autoFocus
                                    />
                                    <input
                                        type="number"
                                        value={editForm.price}
                                        onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                                        style={{ width: '100px' }}
                                    />
                                    <button className="btn-primary" style={{ padding: '0.5rem' }} onClick={() => saveEdit(item.id)}>
                                        <Check size={18} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <span style={{ fontWeight: 500 }}>{item.name}</span>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>qty: {item.quantity}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{ fontWeight: 600 }}>{item.price.toFixed(2)}</span>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button style={{ background: 'transparent', color: 'var(--text-secondary)' }} onClick={() => startEdit(item)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button style={{ background: 'transparent', color: 'var(--danger)' }} onClick={() => removeItem(item.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer with Tax/Service inputs and Totals */}
            <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tax (%)</label>
                            <input
                                type="number"
                                value={taxRate}
                                onChange={e => setTaxRate(Math.max(0, Number(e.target.value)))}
                                style={{ width: '70px', padding: '0.25rem' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Service (%)</label>
                            <input
                                type="number"
                                value={serviceRate}
                                onChange={e => setServiceRate(Math.max(0, Number(e.target.value)))}
                                style={{ width: '70px', padding: '0.25rem' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.9rem' }}>
                        <div style={{ color: 'var(--text-secondary)' }}>Subtotal: {subtotal.toFixed(2)}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>+ Tax: {taxAmount.toFixed(2)}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>+ Service: {serviceAmount.toFixed(2)}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '0.75rem' }}>
                    <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Calculated Total:</span>
                        <strong style={{ marginLeft: '0.5rem', fontSize: '1.5rem' }}>{grandTotal.toFixed(2)}</strong>
                    </div>
                    <button className="btn-primary" onClick={onNext}>Next: Assign People</button>
                </div>
            </div>
        </div>
    );
}
