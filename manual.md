# Ripened — User Manual

> Version 1.0.0 | Windows

---

## Table of Contents

1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Installation & First Launch](#installation--first-launch)
4. [Audio Setup](#audio-setup)
5. [Interface Walkthrough](#interface-walkthrough)
6. [Tuner](#tuner)
7. [Metronome](#metronome)
8. [Guitar Effects](#guitar-effects)
9. [Keyboard Shortcuts](#keyboard-shortcuts)
10. [Troubleshooting](#troubleshooting)
11. [Glossary](#glossary)

---

## Overview

Ripened is a Windows desktop application designed for guitarists who want a single tool for tuning, timing, and tone shaping. It combines three core utilities:

- A **chromatic tuner** for accurate real-time pitch detection
- A **metronome** with visual and audio feedback
- A **guitar effects chain** for real-time audio processing

Ripened uses ASIO audio drivers to minimise latency, making the effects chain responsive enough for live practice use.

---

## System Requirements

**Minimum:**

- Windows 10 (64-bit) or later
- Dual-core processor, 2GHz or higher
- 4GB RAM
- Audio interface with ASIO driver support (or ASIO4ALL for standard devices)

**Recommended:**

- Windows 10/11 (64-bit)
- Quad-core processor
- 8GB RAM
- Dedicated audio interface (e.g. Focusrite Scarlett series)

**Hardware:**

- Electric or electro-acoustic guitar
- Audio interface or sound card with instrument input
- Amplifier

---

## Installation & First Launch

### Step 1 — Install ASIO Drivers

ASIO drivers are required before launching Ripened. Without them, the effects chain will not function as intended.

If your audio interface came with its own drivers (e.g. Focusrite, Scarlett, PreSonus), install those from the manufacturer's website or the included disc.

If you are using a standard Windows audio device, install **ASIO4ALL**:

1. Download from [asio4all.org](https://www.asio4all.org)
2. Run the installer and follow the on-screen instructions
3. Restart your computer before proceeding

### Step 2 — Install Ripened

1. Download `RipenedInstaller.exe` from the [Releases](../../releases) page at [Ripened GitHub](https://github.com/RyGuyFalls0/Dissertation-second-try)
2. Run the installer and follow the on-screen instructions
3. Launch Ripened from the desktop shortcut or Start Menu

### Step 3 — First Launch

On launch you will select your ASIO device. Choose your audio interface from the dropdown. If nothing appears, confirm your ASIO drivers are correctly installed and your interface is connected.

## Audio Setup

Getting your audio configuration right is the most important step for a good experience with Ripened, particularly for the effects chain.

### Connecting Your Guitar

1. Connect your guitar to the instrument input (usually labelled **Hi-Z** or **Inst**) on your audio interface
2. Connect your audio interface to your computer via USB or Thunderbolt
3. Connect headphones or speakers to your interface's output

### Configuring Your ASIO Driver

1. Open your ASIO driver control panel (this is separate from Ripened — use your interface's software, or the ASIO4ALL tray icon)
2. Set the **buffer size to 256 samples** — this is the recommended setting for Ripened
   - Lower buffer sizes (e.g. 64, 128) reduce latency but may cause glitches depending on your hardware
   - Higher buffer sizes (e.g. 512, 1024) are more stable but increase the delay between playing and hearing the processed signal
3. Set the **sample rate to 44100 Hz** (44.1kHz) unless you have a specific reason to use another rate

### Selecting Your Device in Ripened

1. Launch Ripened
2. Select the correct **input channel** corresponding to where your guitar is plugged in
3. You should now see the tuner and level meters respond when you play

---

## Interface Walkthrough

The Ripened interface is divided into three main panels, accessible via the tab bar at the top of the window:

| Panel                       | Description                           |
| --------------------------- | ------------------------------------- |
| **Practice Tools Carousel** | Houses Waveform, Metronome, and Tuner |
| **Effects Drag and Drop**   | Real-time guitar signal processing    |
| **I/O Selection**           | Controls I/O                          |

There is also **Gain Sliders** on either side of the screen, an **ASIO Toggle** between the I/O selection and a **Mute Input Button** underneath the carousel.

---

## Tuner

### Overview

The chromatic tuner detects the pitch of your guitar signal in real time and displays the closest note name along with how far you are from it in **cents** (hundredths of a semitone).

### Display Elements

| Element                  | Description                                               |
| ------------------------ | --------------------------------------------------------- |
| **Start Tuner Button**   | Activates the tuner                                       |
| **Note name**            | The nearest detected pitch (e.g. E, A, D)                 |
| **Octave number**        | The octave of the detected note (e.g. E2, A2)             |
| **Cents indicator**      | A needle or bar showing deviation from the target pitch   |
| **Flat/Sharp indicator** | Lights up when you are significantly below or above pitch |

### How to Tune

1. Play a single open string and let the note sustain
2. Watch the note name display — confirm it shows the string you are tuning
3. Adjust the tuning peg until the cents indicator is centred and stable
4. Repeat for each string

### Tips

- **Play cleanly** — muted strings or harmonics can confuse the pitch detector
- **Let notes sustain** — the detector needs a moment to lock on, especially on lower strings
- **Tune in a quiet environment** if using a microphone input; background noise can affect detection

---

## Metronome

### Overview

The metronome provides a steady pulse at a set tempo to help you practise timing. It produces both an audible click and a visual beat indicator.

### Controls

| Control           | Description                                      |
| ----------------- | ------------------------------------------------ |
| **BPM display**   | Shows the current tempo in beats per minute      |
| **BPM up/down**   | Increment or decrement the tempo by 1 BPM        |
| **Start / Stop**  | Begin or stop the metronome                      |
| **Volume Slider** | Increase or decrease the volume of the metronome |

### Setting a Tempo

- Use the **up/down controls** to dial in an exact BPM

---

## Waveform

### Overview

Visualises the waveform after effect processing

---

## I/O selection

When the program launches, the ASIO slider is set to active and the output selection is disabled. This is due to ASIO's requirement that I/O must be aligned for ASIO to function.

### Controls

| Control                    | Description                                                          |
| -------------------------- | -------------------------------------------------------------------- |
| **Input Device Dropdown**  | Allows for selection of input device                                 |
| **Output Device Dropdown** | Allows for selection of output device (disabled when ASIO is active) |
| **Reload Button**          | Refreshes the list of available input and output devices             |
| **ASIO Slider**            | Controls whether ASIO is activated                                   |

---

## Guitar Effects

### Overview

The effects panel lets you process your guitar signal in real time using a chain of audio effects. Effects are applied in sequence from top to bottom.

### Drag and Drop

There are two sections within the drag and drop, `Oyster` and `Active Effects`.

#### Oyster

Oyster stores available effects that can be added to the active effects section. This section is automatically replenished when an effect is moved to active effects.

- **Information modal** - Click on an effect within the Oyster region to open the associated information modal and view the effect-specific animations. The information modal provides specifics on how each effect work, and how different parameters affect the sound
- **Hotkeys** - Each effect has a hotkey assigned to it which is visible on the left of the effect block.

#### Active Effects

The active effects section visualises the effect chain, displaying how effect operations are applied sequentially from top to bottom.

- **Parameter modal** - Click on an effect within the Active Effects region to open the associated parameter modal and make adjustment to a parameter. For parameters adjustments to take effect, the modal must be saved
- **Drag and Drop Reorder** - All effects can be reordered within active effects by dragging and dropping

### Available Effects

#### Distortion

Adds harmonic saturation and clipping to the signal, ranging from subtle warmth to heavy distortion.

| Parameter | Description                                                                              |
| --------- | ---------------------------------------------------------------------------------------- |
| **Drive** | Amount of gain and clipping applied                                                      |
| **Mix**   | Controls the volume balance between the original sound (dry) and the distorted one (wet) |

#### Reverb

Simulates the natural reflections of a physical space, adding depth and ambience.

| Parameter     | Description                                                 |
| ------------- | ----------------------------------------------------------- |
| **Room Size** | Size of the simulated space                                 |
| **Damping**   | How quickly high frequencies decay                          |
| **Mix**       | Balance between dry (unprocessed) and wet (affected) signal |

#### Delay

Repeats the signal after a set time interval, creating echo effects.

| Parameter      | Description                          |
| -------------- | ------------------------------------ |
| **Delay Time** | Delay time in milliseconds           |
| **Feedback**   | How many repeats occur before fading |
| **Mix**        | Balance between dry and wet signal   |

#### Chorus

Modulates a copy of the signal and blends it with the original, creating movement and width.

| Parameter | Description                        |
| --------- | ---------------------------------- |
| **Rate**  | Speed of the modulation            |
| **Depth** | Intensity of the pitch modulation  |
| **Mix**   | Balance between dry and wet signal |

#### Wah-Wah

Despite being present, wah-wah is currently non-operational and will be implemented in a future release.

---

## Gain Sliders

The two gain sliders on either side of the drag and drop are synced so a change to one is reflected in both. When pushed to the highest possible value (100), the sliders will extend to the top of the screen to reflect that this is the max possible setting. As the value increases on the sliders, the colour will transition from red → black incrementally.

## Keyboard Shortcuts

| Shortcut | Action                    |
| -------- | ------------------------- |
| `1`      | Apply Reverb              |
| `2`      | Apply Chorus              |
| `3`      | Apply Delay               |
| `4`      | Apply Distortion          |
| `5`      | Apply WahWah              |
| `d`      | Remove all active effects |

---

## Troubleshooting

### No audio input / tuner not responding

- Confirm your audio interface is connected and powered on
- Check that the correct ASIO device and input channel are selected in Ripened
- Ensure your guitar cable is securely connected to the correct input on your interface
- Open your ASIO driver control panel and confirm the interface is active
- Try running Ripened as Administrator (right-click the shortcut → Run as administrator)

### Effects not processing / high latency

- Confirm ASIO drivers are installed — the effects chain requires ASIO
- Check your buffer size is set to 256 samples in your ASIO driver control panel
- Close other audio applications that may be holding the ASIO driver exclusively
- Try a larger buffer size if you are experiencing crackling or dropouts

### UI not loading

- Ensure the `UI/dist` folder is present in the same directory as the executable
- Reinstalling via the installer should resolve missing UI assets

### Application crashes on launch

- Install the [Visual C++ Redistributable (x64)](https://aka.ms/vs/17/release/vc_redist.x64.exe) from Microsoft
- Confirm you are running Windows 10 64-bit or later

### Tuner giving inconsistent readings

- Play individual strings cleanly with no other strings ringing
- Ensure your input level is healthy — check the level meter at the top of the window
- Background noise on a microphone input can interfere with pitch detection; use a direct connection where possible

---

## Glossary

**ASIO (Audio Stream Input/Output)**
A low-latency audio driver protocol developed by Steinberg. Required by Ripened for real-time effects processing.

**ASIO4ALL**
A free, third-party ASIO driver for standard Windows audio devices that do not have their own ASIO drivers.

**Buffer Size**
The number of audio samples processed at one time. Smaller buffers reduce latency but require more CPU. Measured in samples (e.g. 256 samples).

**Bypass**
Disabling an effect so the signal passes through unprocessed, without removing it from the chain.

**Cents**
A unit for measuring pitch deviation. One semitone equals 100 cents. A tuner reading of −10 cents means the note is slightly flat.

**Chromatic**
Referring to all twelve pitches in the Western musical scale, as opposed to a diatonic (key-specific) tuner that only detects notes within a given key.

**Dry Signal**
The unprocessed guitar signal, before any effects are applied.

**Feedback**
In the context of delay, the number of times a repeat is fed back into the effect to create further repeats.

**Hi-Z / Instrument Input**
A high-impedance input designed for passive instrument pickups like guitar and bass. Using a line-level input for a guitar will result in a weak signal.

**Latency**
The delay between playing a note and hearing it through the system. ASIO drivers and small buffer sizes minimise latency.

**Mix (Wet/Dry)**
A control that blends the effected (wet) signal with the original (dry) signal.

**Sample Rate**
The number of audio samples captured per second. 44100 Hz (44.1kHz) is the standard for music.

**Signal Chain**
The sequence of effects through which an audio signal passes.

**Wet Signal**
The processed guitar signal after effects have been applied.

---

_Ripened — Version 1.0.0_
