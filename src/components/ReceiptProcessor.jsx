import React, { useEffect, useState } from 'react';
import Tesseract from 'tesseract.js';
import { Loader2 } from 'lucide-react';

export default function ReceiptProcessor({ image, onItemsFound }) {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Initializing...');

    useEffect(() => {
        if (!image) return;

        const processImage = async () => {
            setStatus('Scanning Receipt...');
            try {
                const result = await Tesseract.recognize(
                    image,
                    'eng', // receipts are often English or mixed, but 'eng' is a safe default for now
                    {
                        logger: m => {
                            if (m.status === 'recognizing text') {
                                setProgress(Math.floor(m.progress * 100));
                            }
                            setStatus(m.status);
                        }
                    }
                );

                parseText(result.data.text);
            } catch (err) {
                console.error(err);
                setStatus('Error processing image');
            }
        };

        processImage();
    }, [image]);

    const parseText = (text) => {
        setStatus('Parsing Items...');
        const lines = text.split('\n');
        const items = [];

        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (!trimmed) return;

            // Ignore keywords
            const lower = trimmed.toLowerCase();
            if (
                lower.startsWith('total') ||
                lower.startsWith('subtotal') ||
                lower.startsWith('tax') ||
                lower.startsWith('vat') ||
                lower.startsWith('gst') ||
                lower.startsWith('service') ||
                lower.startsWith('balance') ||
                lower.startsWith('change') ||
                lower.startsWith('cash') ||
                lower.startsWith('amount due')
            ) {
                return;
            }

            // Check if line contains a price
            const priceMatch = trimmed.match(/(\d+[\.,]\d{2})/); // Basic match for 10.99 or 1,000.00

            if (priceMatch) {
                // Assume the price is at the end or near the end
                // Let's take the last number found as the price
                const prices = trimmed.match(/(\d+[\.,]\d{2})/g);
                const priceStr = prices[prices.length - 1];

                // Everything before the price is the name (roughly)
                // Clean up the name
                let name = trimmed.replace(priceStr, '').trim();
                // Remove trailing dots or currency symbols
                name = name.replace(/[.$€£¥]*$/, '').trim();

                if (name.length > 0) {
                    items.push({
                        id: `item-${Date.now()}-${index}`,
                        name: name,
                        price: parseFloat(priceStr.replace(',', '.')), // Normalize , to .
                        quantity: 1,
                        originalLine: trimmed
                    });
                }
            }
        });

        onItemsFound(items);
    };

    return (
        <div className="glass-panel animate-fade-in" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <Loader2 className="animate-spin" size={48} color="var(--accent-color)" />
                <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{status}</h3>
                    <div style={{ width: '200px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-color)', transition: 'width 0.2s' }}></div>
                    </div>
                    <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>{progress}%</p>
                </div>
            </div>
        </div>
    );
}
