class Stepper {
  constructor(steps, pins, signals) {
      this.state = 0; // current steps in revolution (0 ~ steps-1)
      this.direction = 1; // 1 for clockwise, -1 for anti-clockwise
      this.rpm = 10;
      this.t = null; // interval ID
      this.steps = steps;
      this.pins = this.setMode(pins, OUTPUT);
      this.signals = this.setSignals(signals);
  }

  setMode(pins, mode) {
      for (var i = 0; i < pins.length; i++) {
          pinMode(pins[i], mode);
      }
      return pins;
  }

  setSignals(signals) {
      if (signals) {
          signals = signals;
      } else if (this.pins.length === 2) {
          signals = [0b01, 0b11, 0b10, 0b00];
      } else if (this.pins.length === 4) {
          signals = [0b1100, 0b0110, 0b0011, 0b1001];
      } else {
          throw "Parameter signals required";
      }
      return signals;
  }

  setSpeed(rpm) {
      this.rpm = rpm;
  }

  step(count, cb) {
      this.direction = count > 0 ? 1 : -1;
      var cnt = Math.abs(count);
      var moved = 0;
      var phases = this.signals.length;
      var sm = (60 * 1000) / (this.steps * this.rpm); // ms/step

      function run() {
          this.state = (this.state + this.direction + phases) % phases;
          this.move();
          moved++;
          if (moved >= cnt) {
              this.stop(cb);
          }
      }
      this.t = setInterval(run.bind(this), sm);
  }

  stop(cb = function(){}) {
      if (this.t) {
          clearInterval(this.t);
      }
      for (var i = 0; i < this.pins.length; i++) {
          digitalWrite(this.pins[i], 0);
      }
      cb();
  }

  move() {
      var bit = this.signals[this.state];
      for (var i = 0; i < this.pins.length; i++) {
          digitalWrite(this.pins[i], (bit >> (this.pins.length - i - 1)) & 1);
      }
  }
}

exports.Stepper = Stepper;