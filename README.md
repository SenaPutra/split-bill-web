# Split Bill 🧾✨

A modern web application that simplifies dividing restaurant bills or shared expenses. 
Upload a receipt photo, let the AI extract the items, and easily drag-and-drop to split costs with friends.

![Split Bill AI Demo](https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3)
*(Note: Replace with actual screenshot of the app)*

## 🚀 Features

-   **AI Receipt Scanning**: Uses **OpenAI Vision** to extract receipt items, tax, and service amounts from uploaded receipt photos.
-   **Smart Parsing**: Automatically structures item name, unit price, quantity, tax, and service.
-   **Interactive Editor**: Fix any typos or scanning errors before you split.
-   **Easy Splitting**:
    -   Create profiles for everyone at the table.
    -   Tap to assign items to one or multiple people.
    -   Automatic splitting of shared items (e.g., appetizers assigned to 3 people are split 3 ways).
-   **Real-time Summary**: Instantly see who owes what.
-   **Tax & Service Support**: Automatically splits tax and service charges proportionally among everyone based on their share.
-   **Premium UI**: Dark mode, glassmorphism effects, and smooth animations.

## 🛠️ Tech Stack

-   **Frontend**: React 18, Vite
-   **Language**: JavaScript
-   **Styling**: Vanilla CSS (Variables, Glassmorphism), Lucide React (Icons)
-   **AI/OCR**: OpenAI Responses API (Vision)
-   **Containerization**: Docker, Docker Compose, Nginx

## 🐳 How to Run

### Option 1: Using Docker (Recommended)

The easiest way to run the app is using Docker. This will build a production-ready image served by Nginx with a backend proxy to OpenAI so API keys are not exposed in browser DevTools.

1.  Make sure you have Docker Installed.
2.  Set environment variable in shell or `.env`: `OPENAI_API_KEY=...`
3.  Run the following command in the project root:

    ```bash
    docker compose up -d --build
    ```

4.  Open your browser and visit:
    👉 **http://localhost:7771**

### Option 2: Local Development

If you want to edit the code or run it without Docker:

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Add your OpenAI key to `.env` as `OPENAI_API_KEY=...` (do not use `VITE_` prefix, this keeps it server-side).
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open the link shown in the terminal (usually `http://localhost:5173`).

## 📂 Project Structure

```
├── src/
│   ├── components/
│   │   ├── ImageUploader.jsx    # Drag & drop input
│   │   ├── ReceiptProcessor.jsx # OpenAI Vision extraction logic
│   │   ├── ItemEditor.jsx       # Edit parsed items
│   │   ├── PersonSetup.jsx      # Add friends
│   │   ├── Splitter.jsx         # Assign items
│   │   └── BillSummary.jsx      # Final calculation
│   ├── App.jsx                  # Main flow controller
│   └── index.css                # Premium Dark Theme styles
├── Dockerfile                   # Multi-stage build (Node -> Nginx)
├── docker-compose.yml           # Container orchestration
└── nginx.conf                   # Web server config
```

## 📝 Usage Guide

1.  **Upload**: Drag & Drop a receipt image.
2.  **Scan**: Wait for the progress bar.
3.  **Edit**: Verify found items. Add any missing ones or fix prices.
4.  **Add People**: Enter names (e.g., "Sena", "Budi") and add them.
5.  **Split**: specific items.
    -   Tap person names on each item card.
    -   Select multiple people to split an item evenly!
6.  **Summary**: View the final breakdown.

---

Built with ❤️ by Babi & Fren's
