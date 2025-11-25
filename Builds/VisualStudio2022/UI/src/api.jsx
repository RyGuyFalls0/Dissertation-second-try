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
    if (data.status === 'success') {
    console.log("success")
    }
} catch (err) {
    console.log(err);
}
};