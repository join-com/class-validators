import { validate } from 'class-validator';
import { IsMoney, IsMoneyValidator } from '../src';

describe('IsMoney validation', () => {
  describe('Validator', () => {
    it('accepts valid money object', () => {
      const validator = new IsMoneyValidator();
      expect(validator.validate({ amount: 100, currency: 'EUR' })).toBeTrue();
    });

    it('rejects money object with missing amount', () => {
      const validator = new IsMoneyValidator();
      expect(validator.validate({ currency: 'EUR' })).toBeFalse();
    });

    it('rejects money object with negative amount', () => {
      const validator = new IsMoneyValidator();
      expect(validator.validate({ amount: -12, currency: 'EUR' })).toBeFalse();
    });

    it('rejects money object with non-numeric amount', () => {
      const validator = new IsMoneyValidator();
      expect(
        validator.validate({ amount: 'Plethora', currency: 'EUR' }),
      ).toBeFalse();
    });

    it('rejects money object with missing currency', () => {
      const validator = new IsMoneyValidator();
      expect(validator.validate({ amount: 1701 })).toBeFalse();
    });

    it('rejects money object with invalid currency code', () => {
      const validator = new IsMoneyValidator();
      expect(validator.validate({ amount: 1701, currency: 'FOO' })).toBeFalse();
    });
  });

  describe('Decorator', () => {
    class GuineaPig {
      @IsMoney()
      public price: any;
    }

    it('accepts valid class', () => {
      const littlePiggy = new GuineaPig();
      littlePiggy.price = {
        amount: 42,
        currency: 'CHF',
      };
      expect.assertions(1);
      validate(littlePiggy).then(errors => {
        expect(errors).toBeEmpty();
      });
    });

    it('rejects invalid class', () => {
      const littlePiggy = new GuineaPig();
      littlePiggy.price = {
        amount: 'Enough',
        currency: 'Gold',
      };
      expect.assertions(1);
      validate(littlePiggy).then(errors => {
        expect(errors).toMatchSnapshot();
      });
    });
  });
});
