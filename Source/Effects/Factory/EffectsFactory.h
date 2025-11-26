#pragma once
#include <JuceHeader.h>
#include "EffectType.h"
#include "../AllEffects.h"

using namespace juce;

class EffectsFactory {
public:
    static std::unique_ptr<AudioEffects> createEffect(const String& name, var specs);
}; 