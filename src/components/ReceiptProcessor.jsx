import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

const OPENAI_MODEL = 'gpt-4.1-mini';

const extractJson = (rawText) => {
  const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not find JSON object in AI response.');
  }
  return JSON.parse(jsonMatch[0]);
};

const readOutputText = (payload) => {
  if (payload.output_text && typeof payload.output_text === 'string') {
    return payload.output_text;
  }

  const chunks = [];
  (payload.output || []).forEach((entry) => {
    (entry.content || []).forEach((content) => {
      if (content.type === 'output_text' && content.text) {
        chunks.push(content.text);
      }
    });
  });

  return chunks.join('\n').trim();
};

export default function ReceiptProcessor({ image, onItemsFound }) {
  const [status, setStatus] = useState('Initializing OpenAI...');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!image) {
      return;
    }

    const processImage = async () => {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

      if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY_HERE') {
        setError('Missing OpenAI API key. Please add VITE_OPENAI_API_KEY to your .env file.');
        return;
      }

      setStatus('Sending receipt to OpenAI...');

      try {
        const prompt = `Analyze this receipt image and extract purchased items.

Rules:
- Include each purchased item with name, unit price, and quantity.
- If quantity is unclear, use 1.
- Use numbers only for price and quantity.
- Return tax and service as total amounts (not percentages).
- If missing, use 0 for tax or service.
- Return ONLY valid JSON, no markdown.

JSON format:
{
  "items": [
    { "name": "Item Name", "price": 10000, "quantity": 1 }
  ],
  "tax": 1000,
  "service": 500
}`;

        const response = await fetch('https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: OPENAI_MODEL,
            input: [
              {
                role: 'user',
                content: [
                  { type: 'input_text', text: prompt },
                  { type: 'input_image', image_url: image }
                ]
              }
            ],
            temperature: 0
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`OpenAI error ${response.status}: ${errText}`);
        }

        const payload = await response.json();
        const text = readOutputText(payload);

        if (!text) {
          throw new Error('OpenAI response did not contain text output.');
        }

        setStatus('Parsing AI response...');

        const data = extractJson(text);
        const validItems = Array.isArray(data.items)
          ? data.items.map((item, index) => ({
            id: `item-${Date.now()}-${index}`,
            name: item.name || 'Unknown Item',
            price: Number(item.price) || 0,
            quantity: Math.max(1, Number(item.quantity) || 1),
            originalLine: `${item.name || 'Unknown'} ${item.price || 0}`
          }))
          : [];

        onItemsFound(validItems, Number(data.tax) || 0, Number(data.service) || 0);
      } catch (err) {
        console.error('OpenAI OCR Error:', err);
        setError(`Failed to process receipt with OpenAI. ${err.message}`);
      }
    };

    processImage();
  }, [image, onItemsFound]);

  if (error) {
    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '2rem', textAlign: 'center', maxWidth: '500px', width: '100%', borderColor: '#ef4444' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: '#ef4444' }}>
          <AlertCircle size={48} />
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
            style={{ background: '#ef4444', marginTop: '1rem' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '3rem', textAlign: 'center', maxWidth: '600px', width: '100%' }}>
      <Loader2 className="animate-spin" size={48} style={{ color: 'var(--accent-color)', margin: '0 auto 1.5rem' }} />
      <h2 style={{ marginBottom: '0.5rem' }}>Processing Receipt</h2>
      <p style={{ color: 'var(--text-secondary)' }}>{status}</p>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
        Using {OPENAI_MODEL} for OCR + item extraction
      </p>
    </div>
  );
}
