export class Effect {
  constructor(name) {
    this.name = name;
  }

  toJSON() {
    return { name: this.name };
  }

  fromJSON(data) {
    Object.assign(this, data);
  }
}

export class Delay extends Effect {
  constructor({ gain = 0.5, time = 300 } = {}) {
    super("Delay");
    this.gain = gain;
    this.time = time;
  }

  toJSON() {
    return {
      name: this.name,
      gain: this.gain,
      time: this.time,
    };
  }
}

export class Reverb extends Effect {
  constructor({ mix = 0.7, decay = 2.0 } = {}) {
    super("Reverb");
    this.mix = mix;
    this.decay = decay;
  }

  toJSON() {
    return {
      name: this.name,
      mix: this.mix,
      decay: this.decay,
    };
  }
}