import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Placeholder rotation logic
  const placeholders = [
    "Paste video URL...",
    "Try a YouTube link!",
    "Paste a Vimeo or Facebook video URL...",
    "Supports Instagram Reels too!",
    "Paste Pinterest video URL...",
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 2500); // Change every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  const downloadVideo = async () => {
    if (!url.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/download',
        { url },
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'video/mp4' });
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'video.mp4';
      link.click();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      alert('Download failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Height of the placeholder (should match input's line height)
  const placeholderHeight = 24; // px, adjust if needed

  return (
    <div className="w-screen h-screen min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-md mx-auto p-8 rounded-3xl shadow-2xl bg-gray-800/90 border border-gray-700">
        <h1 className="text-3xl font-extrabold text-emerald-400 mb-7 tracking-tight text-center drop-shadow">
          VidExtract
        </h1>
        <p className='text-1xl text-emerald-400 mb-7 tracking-tight text-center drop-shadow'>
          A Multiplatform Video Downloader
        </p>
        <div className="relative w-full mb-6">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-4 py-3 border-2 border-emerald-700 rounded-xl focus:outline-none focus:border-emerald-400 text-lg transition bg-gray-900/80 placeholder:text-emerald-300 text-emerald-200"
            style={{ height: `${placeholderHeight + 24}px` }} // add padding for placeholder
            placeholder=""
          />
          {/* Animated placeholder */}
          {!url && (
            <div
              className="pointer-events-none absolute left-4 top-1/2 transform -translate-y-1/2 h-6 overflow-hidden"
              style={{ height: `${placeholderHeight}px` }}
            >
              <div
                className="transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateY(-${placeholderIndex * placeholderHeight}px)`,
                }}
              >
                {placeholders.map((text, idx) => (
                  <div
                    key={idx}
                    className="text-emerald-300 text-lg whitespace-nowrap"
                    style={{ height: `${placeholderHeight}px`, lineHeight: `${placeholderHeight}px` }}
                  >
                    {text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={downloadVideo}
          disabled={loading}
          className={`w-full py-3 text-lg font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 transition
            ${loading
              ? 'bg-emerald-900 text-emerald-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:from-emerald-700 hover:to-teal-600 hover:shadow-xl'
            }`}
        >
          {loading && (
            <svg className="animate-spin h-5 w-5 text-emerald-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          )}
          {loading ? 'Downloading...' : 'Download'}
        </button>
      </div>
    </div>
  );
}

export default App;
