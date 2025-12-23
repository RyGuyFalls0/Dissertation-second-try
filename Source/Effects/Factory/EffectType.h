#ifndef EFFECT_TYPE_H
#define EFFECT_TYPE_H
#include <JuceHeader.h>

using namespace juce;

enum class EffectType {
    Delay,
    Reverb,
    Distortion,
    Chorus,
};

EffectType getEffectType(const String& name);

#endif