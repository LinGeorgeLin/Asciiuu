import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, ArrowRight, Image as ImageIcon, Copy, Download, RefreshCw, Settings2, Monitor, Zap, Sliders, Sun, Moon, Terminal, Cpu, Activity, Info, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ASCII_SETS = {
  standard: '@%#*+=-:. ',
  blocks: '█▓▒░ ',
  minimal: '#+- ',
  binary: '01 ',
  dots: '•· '
};

type Theme = 'classic' | 'matrix' | 'amber' | 'blue';

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [ascii, setAscii] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resolution, setResolution] = useState(100);
  const [charSet, setCharSet] = useState<keyof typeof ASCII_SETS>('standard');
  const [theme, setTheme] = useState<Theme>('classic');
  const [isInverted, setIsInverted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const convertToAscii = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const width = resolution;
    const height = Math.floor((img.height / img.width) * width * 0.55);

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    const chars = ASCII_SETS[charSet];
    let asciiStr = '';
    
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      let brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      if (isInverted) brightness = 1 - brightness;
      
      const charIndex = Math.floor(brightness * (chars.length - 1));
      asciiStr += chars[charIndex];

      if ((i / 4 + 1) % width === 0) {
        asciiStr += '\n';
      }
    }

    setAscii(asciiStr);
    setTimeout(() => setIsProcessing(false), 800);
  }, [resolution, charSet, isInverted]);

  useEffect(() => {
    if (imgRef.current) {
      setIsProcessing(true);
      convertToAscii();
    }
  }, [resolution, charSet, isInverted, convertToAscii]);

  const processFile = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImage(result);
      
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        convertToAscii();
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const copyToClipboard = () => {
    if (!ascii) return;
    navigator.clipboard.writeText(ascii);
  };

  const downloadAscii = () => {
    if (!ascii) return;
    const element = document.createElement('a');
    const file = new Blob([ascii], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'ascii-art.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center pt-4 px-4 pb-0 md:pt-12 md:px-12 md:pb-0 overflow-x-hidden selection:bg-white/10">
      <div className="bg-grain" />
      
      {/* Metallic Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-white/[0.02] blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-white/[0.02] blur-[150px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-transparent via-white/[0.01] to-transparent" />
      </div>

      {/* Navigation Bar */}
      <nav className="w-full max-w-6xl flex justify-between items-center z-50 mb-8 md:mb-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 group cursor-default"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center group-hover:border-white/30 transition-colors">
            <Terminal size={16} className="text-white/60 md:hidden" />
            <Terminal size={20} className="text-white/60 hidden md:block" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tighter leading-none">Asciiuu</h1>
            <span className="text-[8px] md:text-[10px] text-white/30 uppercase tracking-[0.2em]">Visual Processor</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex items-center gap-8 text-[10px] uppercase tracking-[0.3em] text-white/20"
        >
          <div className="flex items-center gap-2">
            <Activity size={12} />
            <span>System: Online</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu size={12} />
            <span>Buffer: 1024KB</span>
          </div>
        </motion.div>
      </nav>

      {/* Main Interface */}
      <main className="flex flex-col items-center z-10 w-full max-w-6xl flex-1">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 w-full">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-3 w-full max-w-[400px]"
          >
            <div className="flex justify-between items-end px-2">
              <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-white/30">Source_Input</span>
              <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-white/10">01</span>
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file?.type.startsWith('image/')) processFile(file);
              }}
              className="aspect-square w-full bg-[#1a1b1c] rounded-[18px] border border-white/5 hover:border-white/20 transition-all cursor-pointer flex items-center justify-center overflow-hidden relative shadow-2xl group"
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              
              <AnimatePresence mode="wait">
                {image ? (
                  <motion.img
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={image}
                    className="w-full h-full object-cover opacity-40 group-hover:opacity-20 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <motion.div className="flex flex-col items-center gap-4 md:gap-6 text-white/10 group-hover:text-white/30 transition-colors">
                    <div className="p-5 md:p-6 rounded-full bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
                      <Upload size={24} className="md:hidden" strokeWidth={1} />
                      <Upload size={32} className="hidden md:block" strokeWidth={1} />
                    </div>
                    <p className="text-[9px] md:text-[10px] font-medium tracking-[0.3em] uppercase">Initialize Upload</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {image && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <RefreshCw className="text-white/40" size={32} />
                </div>
              )}
            </div>
          </motion.div>

          {/* Center Connector */}
          <div className="flex flex-col items-center gap-2 md:gap-4 text-white/10">
            <div className="h-8 md:h-12 w-px bg-white/10 hidden md:block" />
            <ArrowRight size={20} className="rotate-90 md:rotate-0 md:size-6" />
            <div className="h-8 md:h-12 w-px bg-white/10 hidden md:block" />
          </div>

          {/* Output Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-3 w-full max-w-[400px]"
          >
            <div className="flex justify-between items-end px-2">
              <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-white/30">Processed_Output</span>
              <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-white/10">02</span>
            </div>
            <div className="aspect-square w-full bg-[#121314] rounded-[18px] border border-white/5 flex items-center justify-center overflow-hidden relative shadow-2xl">
              {isProcessing && <div className="scanline animate-scan" />}
              
              <AnimatePresence mode="wait">
                {ascii ? (
                  <motion.div 
                    key="ascii-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full p-4 md:p-6 overflow-auto scrollbar-hide"
                  >
                    <div 
                      className={`ascii-output theme-${theme} leading-[0.6]`}
                      style={{ fontSize: `${Math.max(3, 600 / resolution)}px` }}
                    >
                      {ascii}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div className="flex flex-col items-center gap-4 md:gap-6 text-white/5">
                    <Monitor size={40} className="md:size-12" strokeWidth={0.5} />
                    <span className="text-[9px] md:text-[10px] uppercase tracking-[0.4em]">Awaiting Data</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {ascii && !isProcessing && (
                <div className="absolute top-3 right-3 md:top-4 md:right-4 flex flex-col gap-2">
                  <button onClick={copyToClipboard} className="p-2 md:p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-all text-white/30 hover:text-white">
                    <Copy size={14} className="md:size-4" />
                  </button>
                  <button onClick={downloadAscii} className="p-2 md:p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-all text-white/30 hover:text-white">
                    <Download size={14} className="md:size-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Control Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 md:mt-12 w-full max-w-4xl flex flex-col gap-6 p-5 md:p-6 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-xl"
        >
          {/* Top Row: Sliders & Basic Toggles */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase tracking-widest text-white/30">Resolution_Density</span>
                <span className="text-[9px] text-white/20 sm:hidden">{resolution}px</span>
              </div>
              <input 
                type="range" min="50" max="200" step="10" 
                value={resolution} onChange={(e) => setResolution(Number(e.target.value))}
                className="w-full sm:w-48 accent-white/20"
              />
            </div>

            <div className="flex items-center justify-between w-full sm:w-auto gap-8">
              <div className="flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-widest text-white/30">Theme_Profile</span>
                <div className="flex gap-3">
                  {(['classic', 'matrix', 'amber', 'blue'] as Theme[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`w-4 h-4 rounded-full border transition-all ${
                        theme === t ? 'border-white scale-125' : 'border-transparent opacity-30 hover:opacity-100'
                      } ${
                        t === 'classic' ? 'bg-white' : t === 'matrix' ? 'bg-[#00ff41]' : t === 'amber' ? 'bg-[#ffb000]' : 'bg-[#00f2ff]'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="h-8 w-px bg-white/5 hidden sm:block" />
              
              <div className="flex flex-col gap-2">
                <span className="text-[9px] uppercase tracking-widest text-white/30">Invert_Signal</span>
                <button 
                  onClick={() => setIsInverted(!isInverted)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all ${isInverted ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/20 hover:text-white/40'}`}
                >
                  {isInverted ? <Sun size={12} /> : <Moon size={12} />}
                  <span className="text-[9px] uppercase tracking-widest">{isInverted ? 'On' : 'Off'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-white/5" />

          {/* Bottom Row: Character Sets */}
          <div className="flex flex-col gap-3">
            <span className="text-[9px] uppercase tracking-widest text-white/30">Character_Set_Algorithm</span>
            <div className="flex flex-wrap gap-2">
              {Object.keys(ASCII_SETS).map((set) => (
                <button
                  key={set}
                  onClick={() => setCharSet(set as keyof typeof ASCII_SETS)}
                  className={`flex-1 sm:flex-none px-3 py-2 rounded-md text-[9px] uppercase tracking-widest transition-all border ${
                    charSet === set ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/20 hover:text-white/40'
                  }`}
                >
                  {set}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
        <footer className="mt-auto pt-12 pb-20 w-full max-w-6xl text-right text-white/10 text-[8px] md:text-[9px] uppercase tracking-[0.5em]">
          &copy; 2026 Asciiuu Systems
        </footer>
      </main>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
