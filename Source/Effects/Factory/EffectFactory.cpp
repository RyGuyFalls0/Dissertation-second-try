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

            if (specs->hasProperty("mix"))
                mix = (float)specs->getProperty("mix");
        }

        effect = std::make_unique<Delay>(delayTime, feedback, mix);
        break;
    }

    case EffectType::Chorus:
    {
        DBG("Chorus is being created");

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

            if (specs->hasProperty("mix"))
                mix = (float)specs->getProperty("mix");
        }

        effect = std::make_unique<Chorus>(rate, depth, mix, phase);
        break;
    }

    case EffectType::Distortion:
    {
        float drive = 0.5f;
        float mix = 1.0f;

        if (specs != nullptr)
        {
            if (specs->hasProperty("drive"))
                drive = (float)specs->getProperty("drive");

            if (specs->hasProperty("mix"))
                mix = (float)specs->getProperty("mix");
        }

        effect = std::make_unique<Distortion>(drive, mix);
        break;
    }

    default:
        break;
    }

    return effect;
}
