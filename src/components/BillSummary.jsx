import React, { useState } from 'react';
import { RefreshCcw } from 'lucide-react';

export default function BillSummary({ items, people, assignments, taxRate, serviceRate, onReset }) {

    const calculateTotals = () => {
        const totals = {};
        let assignedSubtotal = 0;

        // Initialize totals
        people.forEach(p => {
            totals[p.id] = {
                name: p.name,
                color: p.color,
                subtotal: 0,
                taxShare: 0,
                serviceShare: 0,
                total: 0,
                items: []
            };
        });

        // Calculate subtotals from items
        items.forEach(item => {
            const assignedIds = assignments[item.id] || [];
            if (assignedIds.length > 0) {
                const splitPrice = item.price / assignedIds.length;
                assignedIds.forEach(pid => {
                    if (totals[pid]) {
                        totals[pid].subtotal += splitPrice;
                        totals[pid].items.push({ name: item.name, price: splitPrice });
                        assignedSubtotal += splitPrice;
                    }
                });
            }
        });

        // Distribute Tax and Service proportionally based on subtotal share
        people.forEach(p => {
            const person = totals[p.id];
            if (assignedSubtotal > 0 && person.subtotal > 0) {
                const ratio = person.subtotal / assignedSubtotal;

                // Calculate total tax/service amounts based on the ASSIGNED subtotal
                const totalTaxAmt = assignedSubtotal * (taxRate / 100);
                const totalServiceAmt = assignedSubtotal * (serviceRate / 100);

                person.taxShare = totalTaxAmt * ratio;
                person.serviceShare = totalServiceAmt * ratio;
                person.total = person.subtotal + person.taxShare + person.serviceShare;
            }
        });

        return Object.values(totals);
    };

    const totals = calculateTotals();

    // Calculate Grand Totals for display
    const totalAssignedRef = totals.reduce((sum, p) => sum + p.subtotal, 0);
    const totalTaxRef = totalAssignedRef * (taxRate / 100);
    const totalServiceRef = totalAssignedRef * (serviceRate / 100);
    const grandTotalRef = totalAssignedRef + totalTaxRef + totalServiceRef;

    return (
        <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', height: '80vh' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Bill Summary</h2>

                <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <span>Subtotal: {totalAssignedRef.toFixed(2)}</span>
                        <span>Tax ({taxRate}%): {totalTaxRef.toFixed(2)}</span>
                        <span>Svc ({serviceRate}%): {totalServiceRef.toFixed(2)}</span>
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                        Grand Total: <span style={{ color: 'var(--success)' }}>{grandTotalRef.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                {totals.map(person => (
                    <div key={person.name} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ background: person.color, padding: '1rem', color: '#1e293b' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <h3 style={{ fontSize: '1.25rem' }}>{person.name}</h3>
                                <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>{person.total.toFixed(2)}</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                Sub: {person.subtotal.toFixed(2)} | +{(person.taxShare + person.serviceShare).toFixed(2)} fees
                            </div>
                        </div>
                        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                            {person.items.length === 0 ? (
                                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No items assigned.</p>
                            ) : (
                                person.items.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '0.25rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                                        <span>{item.price.toFixed(2)}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
                <button className="btn-secondary" onClick={onReset} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}>
                    <RefreshCcw size={18} /> Start Over
                </button>
            </div>
        </div>
    );
}
