#include "EffectType.h"

EffectType getEffectType(const String& name) {
    if (name == "Delay") return EffectType::Delay;
    if (name == "Reverb") return EffectType::Reverb;
    if (name == "Distortion") return EffectType::Distortion;
    if (name == "Chorus") return EffectType::Chorus;
    if (name == "WahWah") return EffectType::WahWah;

	// Default case, could throw an exception or handle error
	return EffectType::Delay; // Defaulting to Delay for simplicity
}
