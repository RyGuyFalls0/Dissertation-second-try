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
    const response = await fetch(`/api/audioList`, {
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
    throw err;
  }
};
