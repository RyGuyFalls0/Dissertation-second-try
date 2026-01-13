#include "EffectsFactory.h"
using namespace juce;

std::unique_ptr<AudioEffects> EffectsFactory::createEffect(const String& name, DynamicObject::Ptr specs) {

    std::unique_ptr<AudioEffects> effect;

    switch (getEffectType(name))
    {
    case EffectType::Delay:
    {
        float delayTime = 0.5f;
        float feedback = 0.3f;
        float mix = 0.5f;

        if (specs != nullptr)
        {
            if (specs->hasProperty("delayTime"))
                delayTime = (float)specs->getProperty("delayTime");

            if (specs->hasProperty("feedback"))
                feedback = (float)specs->getProperty("feedback");

            if (specs->hasProperty("wetDryMix"))
                mix = (float)specs->getProperty("wetDryMix");
        }

        effect = std::make_unique<Delay>(delayTime, feedback, mix);
        break;
    }

    case EffectType::Chorus:
    {
        float rate = 1.7f;
        float depth = 0.8f;
        float mix = 1.0f;
        float phase = 0.0f;

        if (specs != nullptr)
        {
            if (specs->hasProperty("rate"))
                rate = (float)specs->getProperty("rate");

            if (specs->hasProperty("depth"))
                depth = (float)specs->getProperty("depth");

            if (specs->hasProperty("wetDryMix"))
                mix = (float)specs->getProperty("wetDryMix");
        }

        effect = std::make_unique<Chorus>(rate, depth, mix, phase);
        break;
    }

    case EffectType::Distortion:
    {
        float drive = 5.0f;
        float mix = 0.8f;

        if (specs != nullptr)
        {
            if (specs->hasProperty("drive"))
                drive = (float)specs->getProperty("drive");

            if (specs->hasProperty("wetDryMix"))
                mix = (float)specs->getProperty("wetDryMix");
        }

        effect = std::make_unique<Distortion>(drive, mix);
        break;
    }

    case EffectType::Reverb:
    {
        float roomSize = 0.5f;
        float damping = 0.5f;
        float mix = 0.3f;
        if (specs != nullptr)
        {
            if (specs->hasProperty("roomSize"))
                roomSize = (float)specs->getProperty("roomSize");
            if (specs->hasProperty("damping"))
                damping = (float)specs->getProperty("damping");
            if (specs->hasProperty("wetDryMix"))
                mix = (float)specs->getProperty("wetDryMix");
        }
        effect = std::make_unique<audiofx::Reverb>(roomSize, damping, mix);
        break;
	}

    case EffectType::WahWah:
    {
        float frequency = 800.0f;
        float resonance = 4.0f;       
        float mix = 0.7f;             

        if (specs != nullptr)
        {
            if (specs->hasProperty("frequency"))
                frequency = (float)specs->getProperty("frequency");

            if (specs->hasProperty("resonance"))
                resonance = (float)specs->getProperty("resonance");

            if (specs->hasProperty("wetDryMix"))
                mix = (float)specs->getProperty("wetDryMix");
        }

        effect = std::make_unique<WahWah>(frequency, resonance, mix);
        break;
    }

    default:
        break;
    }

    return effect;
}
