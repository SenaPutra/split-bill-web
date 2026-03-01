import React from 'react';
import { RefreshCcw } from 'lucide-react';

const lineTotal = (item) => (Number(item.price) || 0) * (Number(item.quantity) || 1);

export default function BillSummary({ items, people, assignments, taxRate, serviceRate, onReset }) {
  const calculateTotals = () => {
    const totals = {};
    let assignedSubtotal = 0;

    people.forEach((p) => {
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

    items.forEach((item) => {
      const assignedIds = assignments[item.id] || [];
      if (!assignedIds.length) {
        return;
      }

      const splitValue = lineTotal(item) / assignedIds.length;
      assignedIds.forEach((pid) => {
        if (!totals[pid]) {
          return;
        }
        totals[pid].subtotal += splitValue;
        totals[pid].items.push({
          name: item.name,
          quantity: item.quantity || 1,
          share: splitValue
        });
      });

      assignedSubtotal += lineTotal(item);
    });

    const totalServiceAmt = assignedSubtotal * (serviceRate / 100);
    const taxBase = assignedSubtotal + totalServiceAmt;
    const totalTaxAmt = taxBase * (taxRate / 100);

    people.forEach((p) => {
      const person = totals[p.id];
      if (assignedSubtotal <= 0 || person.subtotal <= 0) {
        return;
      }

      const ratio = person.subtotal / assignedSubtotal;
      person.taxShare = totalTaxAmt * ratio;
      person.serviceShare = totalServiceAmt * ratio;
      person.total = person.subtotal + person.taxShare + person.serviceShare;
    });

    return {
      peopleTotals: Object.values(totals),
      assignedSubtotal,
      totalTaxAmt,
      totalServiceAmt
    };
  };

  const { peopleTotals, assignedSubtotal, totalTaxAmt, totalServiceAmt } = calculateTotals();
  const allSubtotal = items.reduce((sum, item) => sum + lineTotal(item), 0);
  const grandTotal = assignedSubtotal + totalTaxAmt + totalServiceAmt;
  const unassignedSubtotal = allSubtotal - assignedSubtotal;

  return (
    <div className="glass-panel animate-fade-in bill-summary-shell">
      <div className="bill-summary-header">
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Bill Summary</h2>

        <div className="bill-summary-meta">
          <div className="bill-summary-stats">
            <span>Assigned Subtotal: {assignedSubtotal.toFixed(2)}</span>
            <span>Tax ({taxRate}%): {totalTaxAmt.toFixed(2)}</span>
            <span>Svc ({serviceRate}%): {totalServiceAmt.toFixed(2)}</span>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
            Grand Total: <span style={{ color: 'var(--success)' }}>{grandTotal.toFixed(2)}</span>
          </div>
          {unassignedSubtotal > 0 && (
            <div style={{ marginTop: '0.5rem', color: 'var(--danger)', fontSize: '0.85rem' }}>
              Unassigned items subtotal: {unassignedSubtotal.toFixed(2)}
            </div>
          )}
        </div>
      </div>

      <div className="bill-summary-grid">
        {peopleTotals.map((person) => (
          <div key={person.name} className="bill-summary-card">
            <div style={{ background: person.color, padding: '1rem', color: '#1e293b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '1.2rem', overflowWrap: 'anywhere' }}>{person.name}</h3>
                <span style={{ fontSize: '1.35rem', fontWeight: '800' }}>{person.total.toFixed(2)}</span>
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
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.9rem', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.name} ({item.quantity}x)</span>
                    <span>{item.share.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bill-summary-footer">
        <button className="btn-secondary" onClick={onReset} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}>
          <RefreshCcw size={18} /> Start Over
        </button>
      </div>
    </div>
  );
}
