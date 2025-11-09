import React, { useState, useEffect } from 'react';

function App() {
  const [mode, setMode] = useState('record'); // 'record' or 'upload'
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  // Poll for audio level updates
  useEffect(() => {
    if (mode !== 'record') return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/level');
        const data = await response.json();
        if (data.status === 'success') {
          setAudioLevel(data.level);
          setIsRecording(data.state === 'recording');
        }
      } catch (err) {
        console.error('Failed to get audio level:', err);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [mode]);

  // Poll for upload status when in upload mode
  useEffect(() => {
    if (mode !== 'upload' || !uploadStatus) return;
    const interval = setInterval(async () => {
    try {
      const response = await fetch('/api/upload-status');
      const data = await response.json();
      if (data.status === 'success' && data.uploaded) {
        setUploadedFile({
          filename: data.filename,
          path: data.path
        });
        setUploadStatus(''); // This triggers the cleanup
      }
    } catch (err) {
      console.error('Failed to get upload status:', err);
    }
  }, 500);

    return () => clearInterval(interval);
  }, [mode, uploadStatus]);

  const handleStartMicrophone = async () => {
    try {
      const response = await fetch('/api/start');
      const data = await response.json();
      if (data.status === 'success') {
        setIsRecording(true);
        setError('');
      }
    } catch (err) {
      setError('Failed to start microphone');
    }
  };

  const handleStopMicrophone = async () => {
    try {
      const response = await fetch('/api/stop');
      const data = await response.json();
      if (data.status === 'success') {
        setIsRecording(false);
        setAudioLevel(0);
        setError('');
      }
    } catch (err) {
      setError('Failed to stop microphone');
    }
  };

  const handleFileUpload = async () => {
  try {
    setUploadStatus('opening');
    setError('');
    const response = await fetch('/api/upload');
    const data = await response.json();
    if (data.status === 'success') {
      setUploadStatus('waiting');
    } else {
      setError('Failed to open file chooser');
      setUploadStatus('');
    }
  } catch (err) {
    setError('Failed to upload file');
    setUploadStatus('');
  }
};

  const switchMode = (newMode) => {
    if (isRecording) {
      handleStopMicrophone();
    }
    setMode(newMode);
    setError('');
    setUploadedFile(null);
    setUploadStatus('');
  };

  // Convert level (0-1) to percentage and amplify for better visibility
  const levelPercentage = Math.min(audioLevel * 100 * 5, 100);

  // Create level meter bars
  const meterBars = Array.from({ length: 20 }, (_, i) => {
    const barThreshold = (i + 1) * 5;
    const isActive = levelPercentage >= barThreshold;
    let barColor = 'bg-green-500';
    
    if (i >= 16) barColor = 'bg-red-500';
    else if (i >= 12) barColor = 'bg-yellow-500';
    
    return (
      <div
        key={i}
        className={`h-8 rounded transition-all duration-75 ${
          isActive ? barColor : 'bg-gray-700'
        }`}
      />
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-12 w-full max-w-2xl border border-white/20">
        <h1 className="text-5xl font-bold text-white mb-4 text-center">
          Audio Monitor
        </h1>
        <p className="text-white/70 text-center mb-8">
          Live microphone input or file upload
        </p>

        {/* Mode Switcher */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => switchMode('record')}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
              mode === 'record'
                ? 'bg-purple-600 text-white shadow-lg scale-105'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <span className="text-2xl mr-2">🎤</span>
            Record Mode
          </button>
          <button
            onClick={() => switchMode('upload')}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
              mode === 'upload'
                ? 'bg-purple-600 text-white shadow-lg scale-105'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <span className="text-2xl mr-2">📁</span>
            Upload Mode
          </button>
        </div>

        {/* Record Mode UI */}
        {mode === 'record' && (
          <>
            {/* Status Indicator */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className={`w-4 h-4 rounded-full ${
                isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-500'
              }`} />
              <span className="text-white text-lg">
                {isRecording ? 'Recording' : 'Stopped'}
              </span>
            </div>

            {/* Level Meter */}
            <div className="bg-black/30 rounded-2xl p-8 mb-8 border border-white/10">
              <div className="text-white/70 text-sm mb-4 text-center">
                Audio Level
              </div>
              <div className="flex gap-1 h-8">
                {meterBars}
              </div>
              <div className="text-white/50 text-xs mt-2 text-center">
                {levelPercentage.toFixed(1)}%
              </div>
            </div>

            {/* Control Button */}
            <div className="flex justify-center">
              {!isRecording ? (
                <button
                  onClick={handleStartMicrophone}
                  className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-12 py-6 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-4 text-xl font-semibold"
                >
                  <span className="text-3xl">🎤</span>
                  Start Microphone
                </button>
              ) : (
                <button
                  onClick={handleStopMicrophone}
                  className="group bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-12 py-6 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-4 text-xl font-semibold"
                >
                  <span className="text-3xl">🔇</span>
                  Stop Microphone
                </button>
              )}
            </div>
          </>
        )}

        {/* Upload Mode UI */}
        {mode === 'upload' && (
          <div className="space-y-6">
            {/* Upload Area */}
            <div className="bg-black/30 rounded-2xl p-12 border-2 border-dashed border-white/20 hover:border-purple-500/50 transition-all">
              <div className="text-center">
                <div className="text-6xl mb-4">📁</div>
                <h3 className="text-white text-xl font-semibold mb-2">
                  Upload Audio File
                </h3>
                <p className="text-white/60 mb-6">
                  WAV, MP3, AIFF, or FLAC formats supported
                </p>
                <button
                  onClick={handleFileUpload}
                  disabled={uploadStatus === 'waiting'}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 text-white px-10 py-4 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-xl text-lg font-semibold disabled:cursor-not-allowed"
                >
                  {uploadStatus === 'waiting' ? 'Waiting for file...' : 'Choose File'}
                </button>
              </div>
            </div>

            {/* Uploaded File Info */}
            {uploadedFile && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">✅</div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-lg mb-1">
                      File Uploaded Successfully
                    </h4>
                    <p className="text-white/70">
                      {uploadedFile.filename}
                    </p>
                    <p className="text-white/50 text-sm mt-1">
                      {uploadedFile.path}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="mt-8 text-center text-white/40 text-sm">
          Audio processed by JUCE · UI built with React
        </div>
      </div>
    </div>
  );
}

export default App;