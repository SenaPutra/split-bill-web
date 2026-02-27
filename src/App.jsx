import React, { useState, useEffect, useRef } from 'react';
import ImageUploader from './components/ImageUploader';
import ReceiptProcessor from './components/ReceiptProcessor';
import ItemEditor from './components/ItemEditor';
import PersonSetup from './components/PersonSetup';
import Splitter from './components/Splitter';
import BillSummary from './components/BillSummary';
import { Moon, Sun } from 'lucide-react';

const ANIME_CDN = 'https://cdn.jsdelivr.net/npm/animejs@3.2.2/lib/anime.min.js';

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

  const headerRef = useRef(null);
  const stepContentRef = useRef(null);
  const animeRef = useRef(null);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const playHeaderAnimation = () => {
      if (!animeRef.current || !headerRef.current) {
        return;
      }

      animeRef.current.timeline({ easing: 'easeOutExpo', duration: 750 })
        .add({
          targets: '.title-line',
          translateY: [22, 0],
          opacity: [0, 1],
          delay: animeRef.current.stagger(120)
        })
        .add({
          targets: '.theme-toggle',
          scale: [0.8, 1],
          rotate: ['-12deg', '0deg'],
          opacity: [0, 1]
        }, '-=550');
    };

    if (window.anime) {
      animeRef.current = window.anime;
      playHeaderAnimation();
      return;
    }

    const existingScript = document.querySelector(`script[data-anime="${ANIME_CDN}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', playHeaderAnimation, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = ANIME_CDN;
    script.async = true;
    script.dataset.anime = ANIME_CDN;
    script.onload = () => {
      animeRef.current = window.anime;
      playHeaderAnimation();
    };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!animeRef.current || !stepContentRef.current) {
      return;
    }

    animeRef.current({
      targets: stepContentRef.current,
      opacity: [0, 1],
      translateY: [18, 0],
      scale: [0.98, 1],
      duration: 420,
      easing: 'easeOutQuart'
    });
  }, [step]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    if (animeRef.current) {
      animeRef.current({
        targets: '.theme-toggle',
        scale: [1, 0.88, 1],
        duration: 380,
        easing: 'easeOutBack'
      });
    }
  };

  const handleImageUpload = (imgData) => {
    setImage(imgData);
    setStep('processing');
  };

  const handleItemsFound = (foundItems, foundTax = 0, foundService = 0) => {
    setItems(foundItems);

    const subtotal = foundItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (subtotal > 0) {
      if (foundTax > 0) {
        setTaxRate(parseFloat(((foundTax / subtotal) * 100).toFixed(2)));
      }
      if (foundService > 0) {
        setServiceRate(parseFloat(((foundService / subtotal) * 100).toFixed(2)));
      }
    }

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
      <header
        ref={headerRef}
        style={{
          textAlign: 'center',
          margin: '2rem 0',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative'
        }}
      >
        <button
          onClick={toggleTheme}
          className="glass-panel theme-toggle"
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            padding: '0.5rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--glass-bg)',
            opacity: 0
          }}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={20} color="var(--text-primary)" /> : <Moon size={20} color="var(--text-primary)" />}
        </button>

        <h1
          className="title-line"
          style={{
            fontSize: '2.5rem',
            background: 'linear-gradient(to right, #818cf8, #c084fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            opacity: 0
          }}
        >
          Split Bill Babitampan
        </h1>
        <p className="title-line" style={{ color: 'var(--text-secondary)', opacity: 0 }}>Scan, Edit, and Split costs like a boss.</p>
      </header>

      <main ref={stepContentRef} className="step-shell" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        {step === 'upload' && <ImageUploader onImageUpload={handleImageUpload} />}

        {step === 'processing' && <ReceiptProcessor image={image} onItemsFound={handleItemsFound} />}

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

        {step === 'people' && <PersonSetup people={people} setPeople={setPeople} onNext={() => setStep('split')} />}

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
