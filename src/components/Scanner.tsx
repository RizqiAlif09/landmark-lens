"use client";

import { FileImage, Globe, ChevronDown, Check } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { LanguageCode, SUPPORTED_LANGUAGES } from "@/types/types";

interface ScannerProps {
  onImageSelected: (base64: string, mimeType: string, language: LanguageCode) => void;
}

export default function Scanner({ onImageSelected }: ScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedLang, setSelectedLang] = useState<LanguageCode>("id");
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false); // State untuk menu dropdown
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref untuk klik di luar

  // Tutup dropdown jika user klik di luar area menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Content = result.split(",")[1];
      const mimeType = result.split(";")[0].split(":")[1];
      onImageSelected(base64Content, mimeType, selectedLang);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Helper untuk mendapatkan label bahasa saat ini
  const currentLangLabel = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.label;

  return (
    <div
      className="relative z-10 flex h-full w-full flex-col items-center justify-center overflow-hidden p-6"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <nav
        className="absolute top-0 z-50 flex w-full animate-appear items-center justify-between p-6 md:p-8"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_10px_white]"></div>
          <div className="translate-y-[1px] font-mono text-xs uppercase text-white opacity-90 md:text-sm tracking-widest">
            Landmark Lens
          </div>
        </div>

        <div className="flex items-center gap-4">
          
          {/* --- CUSTOM LANGUAGE DROPDOWN --- */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-medium uppercase tracking-wider backdrop-blur-md transition-all duration-300 md:text-xs ${
                isLangMenuOpen 
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" 
                  : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Globe className="h-3 w-3 md:h-3.5 md:w-3.5" />
              <span>{currentLangLabel}</span>
              <ChevronDown 
                className={`h-3 w-3 transition-transform duration-300 ${isLangMenuOpen ? "rotate-180" : ""}`} 
              />
            </button>

            {/* Dropdown Menu */}
            {isLangMenuOpen && (
              <div className="absolute right-0 top-full mt-3 w-48 origin-top-right animate-in fade-in slide-in-from-top-2">
                <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A]/90 backdrop-blur-xl shadow-2xl ring-1 ring-black/5">
                  <div className="p-1.5">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLang(lang.code);
                          setIsLangMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[11px] font-medium transition-colors md:text-xs ${
                          selectedLang === lang.code
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span className="uppercase tracking-wide">{lang.label}</span>
                        {selectedLang === lang.code && (
                          <Check className="h-3 w-3 text-emerald-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
            <span className="translate-y-[1px] font-mono text-[10px] uppercase text-white opacity-60">
              System Online
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div
        className="relative z-10 animate-appear"
        style={{ animationDelay: "0.4s" }}
      >
        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center space-y-10 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-8 text-center shadow-[0_8px_40px_0_rgba(0,0,0,0.45)] backdrop-blur-3xl transition-all duration-500 hover:border-white/20 hover:bg-white/10 lg:p-16">
          <div className="pointer-events-none absolute left-0 top-0 h-1/2 w-full bg-gradient-to-b from-white/5 to-transparent"></div>

          <div className="relative z-10 space-y-6">
            <div className="mx-auto flex w-fit items-center justify-center rounded-full border border-ar-primary/30 bg-ar-primary/10 px-4 py-1.5 align-top backdrop-blur-sm">
              <span className="translate-y-[1px] font-mono text-xs uppercase text-ar-primary md:text-xs">
                Gemini 2.5 Vision Engine
              </span>
            </div>

            <h1 className="text-5xl font-bold leading-[0.9] tracking-tighter text-white drop-shadow-xl md:text-7xl lg:text-8xl">
              Landmark <br />
              <span className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                Lens
              </span>
            </h1>

            <p className="mx-auto max-w-lg text-sm font-light leading-relaxed tracking-wide text-gray-300 lg:text-lg">
              Upload a landmark photo. Our AI pinpoints the place, verifies the
              facts, and narrates a story in <span className="text-emerald-400 font-medium">{currentLangLabel}</span>.
            </p>
          </div>

          <div className="group relative z-20">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-ar-primary to-purple-600 opacity-20 blur transition duration-1000 group-hover:opacity-50 group-hover:duration-200"></div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-full bg-white px-10 py-6 text-xs font-bold uppercase tracking-wider text-black antialiased shadow-xl transition-transform duration-300 ease-out hover:scale-105 md:px-16 md:py-6 md:text-sm ${
                dragActive ? "scale-110 ring-4 ring-ar-primary/50" : ""
              }`}
            >
              {dragActive ? "Drop Image Now" : "Select Photo"}
            </button>
          </div>
          
          <p className="mt-2 text-xs font-mono text-white/40 uppercase tracking-widest">
            Supported Formats: JPG, PNG, WEBP
          </p>
        </div>

        <div className="absolute -right-12 -top-12 h-24 w-24 animate-float rounded-full bg-gradient-to-br from-ar-primary to-transparent opacity-20 blur-2xl"></div>
        <div
          className="absolute -bottom-8 -left-8 h-32 w-32 animate-float rounded-full bg-gradient-to-tr from-ar-accent to-transparent opacity-20 blur-2xl"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Footer Labels */}
      <div className="absolute bottom-10 flex w-full justify-center">
        <div
          className="flex animate-appear gap-8 px-4 font-mono text-[10px] uppercase tracking-widest text-white/40 md:gap-16"
          style={{ animationDelay: "0.8s" }}
        >
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-white/40"></div>
            <span className="translate-y-[2px] md:translate-y-[1px] md:text-sm">
              Visual Recognition
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-white/40"></div>
            <span className="translate-y-[2px] md:translate-y-[1px] md:text-sm">
              Global Translation
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-white/40"></div>
            <span className="translate-y-[2px] md:translate-y-[1px] md:text-sm">
              Polyglot TTS
            </span>
          </div>
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      {/* Drag and Drop Overlay */}
      {dragActive && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="rounded-2xl border-4 border-dashed border-white/30 p-12 text-center">
            <FileImage className="mx-auto mb-4 h-12 w-12 text-white/80" />
            <h2 className="text-2xl font-bold text-white">Drop Image Here</h2>
            <p className="mt-2 text-sm text-white/70">
              Release to upload your landmark photo
            </p>
          </div>
        </div>
      )}
    </div>
  );
}