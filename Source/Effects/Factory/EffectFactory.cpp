#include "EffectsFactory.h"
using namespace juce;

std::unique_ptr<AudioEffects> EffectsFactory::createEffect(const String& name, var specs) {

    std::unique_ptr<AudioEffects> effect;

    switch (getEffectType(name)) {
    case EffectType::Delay: {
		// Extract parameters from specs if available
        float delayTime = 0.5f;
        float feedback = 0.3f;
        float mix = 0.5f;

        effect = std::make_unique<Delay>(delayTime, feedback, mix);
        break;
    }

    case EffectType::Chorus: {
        // Extract parameters from specs if available
        DBG("Chorus is being created");
        float rate = 0.7f;
        float depth = 0.8f;
        float mix = 1.0f;
        float phase = 0.0f;
        effect = std::make_unique<Chorus>(rate, depth, mix, phase);
        break;
    }
    case EffectType::Distortion: {
        float drive = 0.5f;
        float mix = 1.0f;
        effect = std::make_unique<Distortion>(drive, mix);
        break;
    }

    default:
        // Handle unknown effect
        break;
    }
	return effect;
}
