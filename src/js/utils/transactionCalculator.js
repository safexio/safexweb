function UtxoChooser() {
  if (!(this instanceof UtxoChooser)) {
    return new UtxoChooser;
  }

  this.allUtxos = [];
  this.availableUtxos = [];
  this.usedUtxos = [];
  this.calculatedUtxos = null;
  this.targetAmount = 0;
  this.sum = 0;

  this._calculate = function() {
    // Loop though all available elements, see if any of them allow us to reach our target
    for (let i = 0; i < this.availableUtxos.length; i++) {
      // If we have found our target...
      let currentSum = this.sum + this.availableUtxos[i].satoshis,
          targetSum = this.targetAmount + getFee(this.usedUtxos.length + 1, 2);
      if (currentSum >= targetSum) {
        // Add the value to the sum.
        this.sum += this.availableUtxos[i].satoshis;
        // Remove this value from the "availableUtxos" array, and add it to the
        // "usedUtxos" array which holds the values we need
        this.usedUtxos.push(this.availableUtxos.splice(i, 1)[0]);
        // We're done!
        return this.usedUtxos;
      }
    };

    // Target not reached, but we ran out of elements!
    if (this.availableUtxos.length === 0) {
      return false;
    }
    // Target not reached, so we need to add the largest amount availableUtxos
    // and keep looking.
    else {
      var lastPosition = this.availableUtxos.length - 1;
      // Add the largest availableUtxos amount to the sum
      this.sum += this.availableUtxos[lastPosition].satoshis;
      // Remove it from availableUtxos array and add it to our list of used elements...
      this.usedUtxos.push(this.availableUtxos.splice(lastPosition, 1)[0]);
      // And keep looking!
      return this._calculate();
    }
  }

  return this;
};

// An array of utxo objects -- must have property "satoshis".
// Setting utxos acts as a reset.
UtxoChooser.prototype.utxos = function(utxos) {
  // Sort them: O(n log n)
  utxos.sort(function(a, b) {
    return a.satoshis - b.satoshis;
  });

  this.allUtxos = utxos;
  this.availableUtxos = utxos;
  this.usedUtxos = [];
  this.calculatedUtxos = null;
  this.sum = 0;
  
  return this;
};

UtxoChooser.prototype.target = function(target) {
  this.targetAmount = target;

  return this;
};

UtxoChooser.prototype.calculate = function() {
  if (this.targetAmount === 0) {
    throw new Error('You need to set the target amount.');
  } else if (this.allUtxos.length === 0) {
    throw new Error('You need to set the available utxos.');
  }

  if (this.calculatedUtxos) {
    return this.calculatedUtxos;
  }

  this.calculatedUtxos = this._calculate(this.targetAmount);

  return this.calculatedUtxos;
};

// Get fee based on number of inputs
function getFee(inputs, outputs) {
  var size = (148 * inputs) + (34 * outputs) + 10;

  var fee = Math.ceil(size / 1000) * 10000;

  return fee;
}

/**
 * Given the number of inputs and balance of an address, see the max spendable balance.
 * The spendable balance is balance - required fee.
 *
 * Provide maxAmount as satoshis.
 */
function MaxSpend(numberOfInputs, maxAmount) {
  // To get tx size, use the formula: 148 * number_of_inputs + 34 * number_of_outputs + 10
  // Use 0.0001 as the fee per 1000 bytes

  // Since we want to spend it all, there will only be one output (no change)
  var fee = getFee(numberOfInputs, 1);

  return maxAmount - fee;
}

module.exports = { UtxoChooser, MaxSpend };