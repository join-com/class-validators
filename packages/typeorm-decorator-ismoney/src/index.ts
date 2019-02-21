import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import codes from './codes';

@ValidatorConstraint()
export class IsMoneyValidator implements ValidatorConstraintInterface {
  public validate(money: any) {
    const { amount, currency } = money;
    const isAmountCorrect =
      typeof amount === 'number' && amount >= 0 && amount <= 999999999;
    const isCurrencyCorrect =
      typeof currency === 'string' && codes.includes(currency);
    return isAmountCorrect && isCurrencyCorrect;
  }
}

export function IsMoney(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsMoneyValidator,
    });
  };
}
