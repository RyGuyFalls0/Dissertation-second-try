export const sendEffectsData = async (activeEffectsMetadata) => {
  try {
    // swapped to GET because JUCE WebProvider does not allow to retrieve post requests -- shouldnt matter as this doesnt need to be secure
    const params = new URLSearchParams({ 
      metadata: JSON.stringify(activeEffectsMetadata) 
    });
    const response = await fetch(`/api/effects?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
    });

    const data = await response.json();
} catch (err) {
    console.log(err);
}
};

export const getAudioList = async () => {
  try {
    const response = await fetch(`/api/getAudioList`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
    });
    const data = await response.json();

    if (data.status === 'success') {
      return data
    }
  } catch (err) {
    console.log(err);
  }
};

export const setASIOChange = async () => {
  try {
    const res = await fetch("/api/setASIO");
  }
  catch (error) {
    console.error("Failed to update ASIO mode:", error);
  }
};

export const setAudioIO = async (ioConfig) => {
  try {
    const params = new URLSearchParams({ 
      config: JSON.stringify(ioConfig) 
    });
    const response = await fetch(`/api/setAudioIO?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Audio IO set successfully:", data);
    return data;
  } catch (err) {
    console.error("Failed to set audio IO:", err);
  }
};

export const stopTuner = async () => {
  try {
  const response = await fetch(`/api/stopTuner`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
    });
    const data = await response.json();

    if (data.status === 'success') {
      return data
    }
  } catch (err) {
    console.log(err);
  }
}

export const startTuner = async () => {
  try {
  const response = await fetch(`/api/startTuner`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
    });
    const data = await response.json();

    if (data.status === 'success') {
      return data
    }
  } catch (err) {
    console.log(err);
  }
}

export const getTuning = async () => {
  try {
  const response = await fetch(`/api/getTuning`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
    });
    const data = await response.json();

    if (data.status === 'success') {
      return data
    }
  } catch (err) {
    console.log(err);
  }
}

export const getAudioData = async (wavesurfer, SCALE, NUM_SAMPLES) => {
  try {
    const res = await fetch("/api/getAudioData");
    const data = await res.json();

    let samples;

    if (data.status === "success") {
      samples = Float32Array.from(
        data.samples.map(v => {
          const s = (v ?? 0) * SCALE;
          return Math.max(Math.min(s, 1.0), -1.0);
        })
      );
    } else {
      samples = new Float32Array(NUM_SAMPLES).fill(1e-3);
    }

    if (samples.length !== NUM_SAMPLES) {
      const tmp = new Float32Array(NUM_SAMPLES);
      tmp.set(samples.slice(0, NUM_SAMPLES));
      samples = tmp;
    }

    const buffer = wavesurfer.getDecodedData();
    wavesurfer.load(buffer, samples, 5);

  } catch (e) {
    const samples = new Float32Array(NUM_SAMPLES).fill(1e-3);
    const buffer = wavesurfer.getDecodedData();
    wavesurfer.load(buffer, [samples,samples], 5);
  }
};

export const startMicrophone = async () => {
  try {
    const res = await fetch("/api/startMicrophone");
    const data = await res.json();
    if (data.status === "success") {
      return "success";
    }
    else return "Microphone still inactive";
  } catch (e) {
    return "Microphone still inactive";
  }
};

export const stopMicrophone = async () => {
  try {
    const res = await fetch("/api/stopMicrophone");
    const data = await res.json();
    console.log(data);
    if (data.status === "success") {
      return "success";
    }
    else return "Microphone still active";
  } catch (e) {
    return "Microphone still active" + e;
  }
};

export const applyMasterGain = async (gainDB) => {
  try {
    const params = new URLSearchParams({
      config: JSON.stringify({ gainDB })
    });

    const res = await fetch(`/api/setMasterGain?${params}`);
    const data = await res.json();

    if (data.status === "success") {
      return "success";
    } else {
      return "Gain cannot be set";
    }
  } catch (e) {
    return `Gain cannot be set: ${e.message}`;
  }
};
