import React, { useState, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import ReceiptProcessor from './components/ReceiptProcessor';
import ItemEditor from './components/ItemEditor';
import PersonSetup from './components/PersonSetup';
import Splitter from './components/Splitter';
import BillSummary from './components/BillSummary';
import { Moon, Sun } from 'lucide-react';

function App() {
  const [step, setStep] = useState('upload'); // upload, processing, edit, people, split, summary
  const [image, setImage] = useState(null);
  const [items, setItems] = useState([]);
  const [people, setPeople] = useState([]);
  const [assignments, setAssignments] = useState({}); // { itemId: [personId, ...] }

  // Tax & Service State
  const [taxRate, setTaxRate] = useState(10);
  const [serviceRate, setServiceRate] = useState(5);

  // Theme State
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleImageUpload = (imgData) => {
    setImage(imgData);
    setStep('processing');
  };

  const handleItemsFound = (foundItems) => {
    setItems(foundItems);
    setStep('edit');
  };

  const handleItemsUpdate = (updatedItems) => {
    setItems(updatedItems);
  };

  const handleReset = () => {
    setStep('upload');
    setImage(null);
    setItems([]);
    setPeople([]);
    setAssignments({});
    setTaxRate(10);
    setServiceRate(5);
  };

  return (
    <div className="container">
      <header style={{
        textAlign: 'center',
        margin: '2rem 0',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative'
      }}>
        <button
          onClick={toggleTheme}
          className="glass-panel"
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            padding: '0.5rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--glass-bg)'
          }}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={20} color="var(--text-primary)" /> : <Moon size={20} color="var(--text-primary)" />}
        </button>

        <h1 style={{ fontSize: '2.5rem', background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Split Bill Babitampan</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Scan, Edit, and Split costs like a boss.</p>
      </header>

      <main style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        {step === 'upload' && (
          <ImageUploader onImageUpload={handleImageUpload} />
        )}

        {step === 'processing' && (
          <ReceiptProcessor image={image} onItemsFound={handleItemsFound} />
        )}

        {step === 'edit' && (
          <ItemEditor
            items={items}
            onUpdateItems={handleItemsUpdate}
            taxRate={taxRate}
            setTaxRate={setTaxRate}
            serviceRate={serviceRate}
            setServiceRate={setServiceRate}
            onNext={() => setStep('people')}
          />
        )}

        {step === 'people' && (
          <PersonSetup
            people={people}
            setPeople={setPeople}
            onNext={() => setStep('split')}
          />
        )}

        {step === 'split' && (
          <Splitter
            items={items}
            people={people}
            assignments={assignments}
            setAssignments={setAssignments}
            onNext={() => setStep('summary')}
          />
        )}

        {step === 'summary' && (
          <BillSummary
            items={items}
            people={people}
            assignments={assignments}
            taxRate={taxRate}
            serviceRate={serviceRate}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
}

export default App;
