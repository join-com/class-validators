import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import codes from './codes';
import { IMoney } from './Money';

const settingsDefault = {
  allowNegative: false,
  min: Number.MIN_SAFE_INTEGER,
  max: Number.MAX_SAFE_INTEGER,
  currencies: undefined,
};

interface IMoneyValidationOptions {
  allowNegative?: boolean;
  min?: number;
  max?: number;
  currencies?: string[];
}

@ValidatorConstraint({ name: 'IsMoney', async: false })
export class IsMoneyValidator implements ValidatorConstraintInterface {
  public validate(money: IMoney, args: ValidationArguments) {
    if (!money) {
      return false;
    }
    const { amount, currency } = money;
    const {
      allowNegative,
      min,
      max,
      currencies: customCurrencies,
    } = Object.assign({}, settingsDefault, args.constraints[0]);
    const isAmountCorrect =
      typeof amount === 'number' &&
      (allowNegative || amount >= 0) &&
      amount <= max &&
      amount >= min;
    const isCurrencyCorrect =
      typeof currency === 'string' && codes.includes(currency);
    const isCustomCurrencyCorrect =
      !customCurrencies ||
      (customCurrencies.length && customCurrencies.includes(currency));
    return isAmountCorrect && isCurrencyCorrect && isCustomCurrencyCorrect;
  }

  public defaultMessage(args: ValidationArguments) {
    return `(${JSON.stringify(args.value)}) is not a valid Money object`;
  }
}

/**
 * Checks if a value is a Money type.
 *
 * @param settings Validation settings
 * @param validationOptions class-validator options
 */

export function IsMoney(
  settings?: IMoneyValidationOptions,
  validationOptions?: ValidationOptions,
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [settings],
      validator: IsMoneyValidator,
    });
  };
}
