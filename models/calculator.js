class Calculator {
  constructor(event, bestResult) {
      this.event = event;
      this.bestResult = bestResult;
      this.pointShift = 20000;

      this.formulas = {
          male: {
              shot: { resultShift: 687.7, conversionFactor: 0.042172 },
              discus: { resultShift: 2232.6, conversionFactor: 0.004007 },
              hammer: { resultShift: 2649.4, conversionFactor: 0.0028462 },
              javelin: { resultShift: 2886.8, conversionFactor: 0.0023974 }
          },
          female: {
              shot: { resultShift: 657.53, conversionFactor: 0.0462 },
              discus: { resultShift: 2227.3, conversionFactor: 0.0040277 },
              hammer: { resultShift: 2540, conversionFactor: 0.0030965 },
              javelin: { resultShift: 2214.9, conversionFactor: 0.004073 }
          }
      };
  }

  calculatePoints(gender) {
      const formula = this.formulas[gender][this.event];
      if (!formula) {
          throw new Error('Viga sisestamisel');
      }

      const { resultShift, conversionFactor } = formula;
      return Math.floor(conversionFactor * ((this.bestResult + resultShift) ** 2) - this.pointShift);
  }
}

module.exports = Calculator;
