import React, { useEffect, useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Loader2, AlertCircle } from 'lucide-react';

export default function ReceiptProcessor({ image, onItemsFound }) {
    const [status, setStatus] = useState('Initializing Gemini AI...');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!image) return;

        const processImage = async () => {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

            if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
                setError("Missing Gemini API Key. Please add VITE_GEMINI_API_KEY to your .env file.");
                return;
            }

            setStatus('Sending to Gemini AI...');

            try {
                // Initialize new SDK
                const client = new GoogleGenAI({ apiKey });

                // List of models to try in order of preference
                // 'gemini-1.5-flash-002' is the newer stable version
                // 'gemini-1.5-flash' is the alias
                // 'gemini-1.5-pro' is the fallback flagship
                const models = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"];

                let result = null;
                let usedModel = "";

                // Remove data:image/jpeg;base64, prefix
                const base64Data = image.split(',')[1];

                const prompt = `
                Analyze this receipt image. Extract all purchased items with their prices.
                Also extract the total tax amount and total service charge amount if present.
                If there are discounts, treat them as negative prices if they are line items, or deduct them if they are subtotal adjustments.
                
                Return ONLY valid JSON in this exact format, with no markdown code blocks:
                {
                    "items": [
                        { "name": "Item Name", "price": 10.50, "quantity": 1 }
                    ],
                    "tax": 1.50,
                    "service": 2.00
                }
                `;

                const imagePart = {
                    inlineData: {
                        data: base64Data,
                        mimeType: "image/jpeg",
                    },
                };

                // Try each model until successful
                for (const modelName of models) {
                    try {
                        console.log(`Attempting OCR with model: ${modelName}`);
                        const response = await client.models.generateContent({
                            model: modelName,
                            contents: [
                                {
                                    parts: [
                                        { text: prompt },
                                        imagePart
                                    ]
                                }
                            ]
                        });

                        result = response;
                        usedModel = modelName;
                        break; // Success!
                    } catch (modelError) {
                        console.warn(`Model ${modelName} failed:`, modelError);
                        // Continue to next model
                    }
                }

                if (!result) {
                    throw new Error("All Gemini models failed. Please check your API usage or connection.");
                }

                console.log(`Success with model: ${usedModel}`);

                // In @google/genai SDK, the result object IS the response, and .text is a getter property (not a function)
                const text = result.text;

                if (!text) {
                    console.dir(result, { depth: null });
                    throw new Error("Gemini response is empty or invalid structure.");
                }

                setStatus('Parsing AI Response...');

                // Clean up markdown if Gemini sends it (e.g. ```json ... ```)
                const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const data = JSON.parse(jsonStr);

                // Add IDs to items
                const validItems = Array.isArray(data.items) ? data.items.map((item, index) => ({
                    id: `item-${Date.now()}-${index}`,
                    name: item.name || "Unknown Item",
                    price: parseFloat(item.price) || 0,
                    quantity: item.quantity || 1,
                    originalLine: `${item.name} ${item.price}`
                })) : [];

                onItemsFound(validItems, parseFloat(data.tax) || 0, parseFloat(data.service) || 0);

            } catch (err) {
                console.error("Gemini OCR Error:", err);
                setError("Failed to process receipt with Gemini AI. " + err.message);
            }
        };

        processImage();
    }, [image]);

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
        <div className="glass-panel animate-fade-in" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <Loader2 className="animate-spin" size={48} color="var(--accent-color)" />
                <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{status}</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Powered by Gemini AI 🧠✨</p>
                </div>
            </div>
        </div>
    );
}
