# Ripened

> Guitar Practice & Effects Tool — Version 1.0.0 | Windows

A Windows desktop application for guitarists combining essential practice utilities with real-time audio processing. 

---

## Features

-  **Chromatic Tuner** — accurate real-time pitch detection
-  **Metronome** — adjustable BPM with visual and audio feedback
-  **Guitar Effects** — real-time audio manipulation and effects chain processing

---

## Prerequisites

> ⚠️ **ASIO drivers must be installed before using this application.** ASIO is required for low-latency audio processing — without it, effects will not function as intended.

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

1. Connect your guitar to an amplifier, or another high-impedence resolver, and your amp to the computer
2. From your chosen ASIO audio interface handler, set the sample size to 256. Lower values could cause visual glitches, and higher values will increase the latency of the operation 
3. Launch the application
4. Select your chosen ASIO option from the drop down.
5.  Play that funky music
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
 
### UI
 
1. Make edits in `NewProject/UI` and preview with `npm run dev`
2. When satisfied, run `npm run build` to produce the `dist` folder
3. Move `dist` into `NewProject\Builds\VisualStudio2022\UI`
 
### Backend
 
1. Open the `.jucer` file in Projucer and save to regenerate the Visual Studio solution
2. Open the generated `.sln` in Visual Studio 2022
3. Set configuration to **Release** and platform to **x64**
4. Build with `Ctrl+Shift+B`
 
The compiled executable will be at:
 
```
Builds/VisualStudio2022/x64/Release/App/NewProject.exe
```

5. Alternatively the application can be run within Visual Studio using the provided Local Windows Debugger 
 
### Creating an Installer
 
Use [Inno Setup](https://jrsoftware.org/isinfo.php) with the provided `installer.iss` script in the project root to bundle the executable and UI assets into a single installer.
 
---
 
## Troubleshooting
 
**No audio input / effects not working**
- Confirm ASIO drivers are installed and your audio device is selected
- Check that your guitar is connected to the correct input channel
- Try running the application as Administrator
 
**UI not loading**
- Ensure the `UI/dist` folder is present in the same directory as the executable
- Reinstalling via the installer should resolve this
 
**Application crashes on launch**
- Install the [Visual C++ Redistributable (x64)](https://aka.ms/vs/17/release/vc_redist.x64.exe) from Microsoft
 
---
 
*Ripened — Version 1.0.0*
