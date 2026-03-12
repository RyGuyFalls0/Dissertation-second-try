# NewProject

> Guitar Practice & Effects Tool — Version 1.0.0 | Windows

A Windows desktop application for guitarists combining essential practice utilities with real-time audio processing. Tune up, lock in your timing, and shape your tone — all from a single interface.

---

## Features

- 🎵 **Chromatic Tuner** — accurate real-time pitch detection
- 🥁 **Metronome** — adjustable BPM with visual and audio feedback
- 🎸 **Guitar Effects** — real-time audio manipulation and effects chain processing

---

## Prerequisites

> ⚠️ **ASIO drivers must be installed before using this application.** ASIO is required for low-latency audio processing — without it, the effects and tuner will not function as intended.

If your audio interface came with its own ASIO drivers (e.g. Focusrite, Scarlett, PreSonus), use those. Otherwise, you can use **ASIO4ALL** for standard Windows audio devices:

- Download from [asio4all.org](https://www.asio4all.org)
- Run the installer and follow the on-screen instructions
- Restart your computer after installation

---

## Installation

1. Download the latest `NewProjectInstaller.exe` from the [Releases](../../releases) page
2. Run the installer and follow the on-screen instructions
3. Launch NewProject from the desktop shortcut or Start Menu

---

## Usage

### Getting Started

1. Connect your guitar to your audio interface or sound card input
2. Launch NewProject
3. On first launch, select your ASIO driver from the audio settings panel
4. Set your input channel to match your guitar input
5. Set your ASIO buffer size to **256 samples** for optimal performance — lower values may cause audio glitches, higher values will increase latency

### Tuner

The chromatic tuner listens to your guitar input in real time and displays the detected note and pitch deviation. Tune until the indicator is centred for accurate pitch.

### Metronome

Set your desired BPM using the tempo control and click Start. The metronome provides both an audio click and a visual beat indicator.

### Guitar Effects

The effects panel allows you to apply real-time processing to your guitar signal. Chain effects together and adjust parameters to dial in your tone. Audio is processed with minimal latency via your ASIO driver.

---

## Developer Setup

### Requirements

- Windows 10 or later
- Visual Studio 2022 (with C++ Desktop Development workload)
- [JUCE Framework](https://juce.com) / Projucer
- Node.js and npm
- ASIO SDK (optional, for ASIO support at compile time)

### 1. Build the React UI

```bash
cd Builds/VisualStudio2022/UI
npm install
npm run build
```

This outputs the compiled UI to the `dist/` folder.

### 2. Build the C++ Application

1. Open the `.jucer` file in Projucer
2. Save the project to regenerate the Visual Studio solution
3. Open the generated `.sln` in Visual Studio 2022
4. Set configuration to **Release** and platform to **x64**
5. Build the solution (`Ctrl+Shift+B`)

The compiled executable will be at:
```
Builds/VisualStudio2022/x64/Release/App/NewProject.exe
```

### 3. Creating an Installer

Use [Inno Setup](https://jrsoftware.org/isinfo.php) with the provided `installer.iss` script in the project root. This bundles the executable and UI assets into a single downloadable installer.

---

## Troubleshooting

**No audio input / effects not working**
- Confirm ASIO drivers are installed and your audio device is selected in settings
- Check that your guitar is connected to the correct input channel
- Try running the application as Administrator

**UI not loading**
- Ensure the `UI/dist` folder is present in the same directory as the executable
- Reinstalling via the installer should resolve this

**Application crashes on launch**
- Install the [Visual C++ Redistributable (x64)](https://aka.ms/vs/17/release/vc_redist.x64.exe) from Microsoft

---

*NewProject — Version 1.0.0*
