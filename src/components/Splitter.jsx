import React from 'react';

const lineTotal = (item) => (Number(item.price) || 0) * (Number(item.quantity) || 1);

export default function Splitter({ items, people, assignments, setAssignments, onNext }) {
  const toggleAssignment = (itemId, personId) => {
    setAssignments((prev) => {
      const currentAssigned = prev[itemId] || [];
      if (currentAssigned.includes(personId)) {
        const newAssigned = currentAssigned.filter((id) => id !== personId);
        if (newAssigned.length === 0) {
          const { [itemId]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [itemId]: newAssigned };
      }
      return { ...prev, [itemId]: [...currentAssigned, personId] };
    });
  };

  const unassignedCount = items.filter((item) => !(assignments[item.id] || []).length).length;

  return (
    <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', height: '85vh' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
        <h2>Assign Items</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Tap people to assign them to an item.</p>
        {unassignedCount > 0 && (
          <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {unassignedCount} item belum dibagi.
          </p>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {items.map((item) => {
            const assignedIds = assignments[item.id] || [];
            const isAssigned = assignedIds.length > 0;
            const total = lineTotal(item);
            const splitEach = assignedIds.length ? total / assignedIds.length : total;

            return (
              <div key={item.id} style={{
                background: isAssigned ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.05)',
                padding: '1rem',
                borderRadius: '12px',
                border: isAssigned ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '1rem' }}>
                  <span style={{ fontWeight: 500 }}>{item.name} <small style={{ color: 'var(--text-secondary)' }}>({item.quantity || 1}x)</small></span>
                  <span style={{ fontWeight: 600 }}>{total.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {people.map((person) => {
                    const isSelected = assignedIds.includes(person.id);
                    return (
                      <button
                        key={person.id}
                        onClick={() => toggleAssignment(item.id, person.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          background: isSelected ? person.color : 'rgba(255,255,255,0.1)',
                          color: isSelected ? 'white' : 'var(--text-secondary)',
                          border: isSelected ? `1px solid ${person.color}` : '1px solid rgba(255,255,255,0.1)',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.875rem',
                          opacity: isSelected ? 1 : 0.7
                        }}
                      >
                        {person.name}
                        {isSelected && <span style={{ fontSize: '0.7em' }}> ({splitEach.toFixed(2)})</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)', textAlign: 'right', background: 'rgba(0,0,0,0.2)' }}>
        <button className="btn-primary" onClick={onNext}>
          View Summary
        </button>
      </div>
    </div>
  );
}
