import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';

export default function PersonSetup({ people, setPeople, onNext }) {
    const [name, setName] = useState('');

    const addPerson = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setPeople([...people, {
            id: `p-${Date.now()}`,
            name: name.trim(),
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
        }]);
        setName('');
    };

    const removePerson = (id) => {
        setPeople(people.filter(p => p.id !== id));
    };

    return (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', maxWidth: '600px', width: '100%' }}>
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Who is splitting?</h2>

            <form onSubmit={addPerson} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <input
                    type="text"
                    placeholder="Enter name (e.g. Alice)"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ flex: 1 }}
                    autoFocus
                />
                <button type="submit" className="btn-primary" disabled={!name.trim()}>
                    <UserPlus size={18} />
                </button>
            </form>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                {people.map(person => (
                    <div key={person.id} style={{
                        background: 'rgba(255,255,255,0.1)',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        border: `1px solid ${person.color}`
                    }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: person.color }}></div>
                        <span>{person.name}</span>
                        <button onClick={() => removePerson(person.id)} style={{ background: 'transparent', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                            <X size={14} />
                        </button>
                    </div>
                ))}
                {people.length === 0 && <p style={{ color: 'var(--text-secondary)', width: '100%', textAlign: 'center' }}>Add at least one person.</p>}
            </div>

            <div style={{ textAlign: 'right' }}>
                <button className="btn-primary" onClick={onNext} disabled={people.length === 0}>
                    Start Splitting
                </button>
            </div>
        </div>
    );
}
