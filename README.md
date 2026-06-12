# 📄 Pandoc Document Converter

A lightweight desktop application for converting documents between multiple formats using Pandoc.

![Status](https://img.shields.io/badge/status-ready--to--build-orange)
![Size](https://img.shields.io/badge/size-~10MB-green)
![Platform](https://img.shields.io/badge/platform-Windows-blue)

## ✨ Features
- **Multi-Format**: Convert between PDF, DOCX, Markdown, HTML, EPUB, and more
- **Auto-Detection**: Automatically detects input file format
- **Smart Conversion**: Shows only compatible output formats
- **Beautiful UI**: Modern, responsive interface with dark mode
- **Lightning Fast**: Built with Tauri + Rust for native performance
- **Tiny Size**: ~10MB app (10× smaller than Electron alternatives)

## 🎯 Supported Formats

**Input**  
`.md`, `.docx`, `.html`, `.txt`, `.rst`, `.epub`, `.tex`, `.odt`, `.rtf`

**Output**  
`PDF`, `DOCX`, `Markdown`, `HTML`, `EPUB`, `PPTX`, `TXT`

## 🚀 Getting Started

### Prerequisites

1. **Rust** (for building): https://rustup.rs/
2. **Node.js** (for dependencies): https://nodejs.org/
3. **Pandoc** (for conversion): https://pandoc.org/installing.html
4. **Visual Studio C++ Build Tools**:  
   https://visualstudio.microsoft.com/visual-cpp-build-tools/  
   - Select **Desktop development with C++**

### Installation

```powershell
# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
