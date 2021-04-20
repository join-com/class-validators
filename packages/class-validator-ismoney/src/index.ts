import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator'

import { IMoney } from './Money'
import { codes } from './codes'

const settingsDefault = {
  allowNegative: false,
  min: Number.MIN_SAFE_INTEGER,
  max: Number.MAX_SAFE_INTEGER,
  currencies: undefined,
}

interface IMoneyValidationOptions {
  allowNegative?: boolean
  min?: number
  max?: number
  currencies?: string[]
}

@ValidatorConstraint({ name: 'IsMoney', async: false })
export class IsMoneyValidator implements ValidatorConstraintInterface {
  // TODO: Refine `args` type
  public validate(money: IMoney, args: ValidationArguments): boolean {
    if (!money) {
      return false
    }
    const { amount, currency } = money

    const { allowNegative, min, max, currencies: customCurrencies } = {
      ...settingsDefault,
      ...(args.constraints[0] as IMoneyValidationOptions),
    }

    const isAmountCorrect =
      typeof amount === 'number' &&
      (allowNegative || amount >= 0) &&
      amount <= max &&
      amount >= min

    const isCurrencyCorrect =
      typeof currency === 'string' && codes.includes(currency)

    const isCustomCurrencyCorrect =
      !customCurrencies ||
      (customCurrencies.length > 0 && customCurrencies.includes(currency))

    return isAmountCorrect && isCurrencyCorrect && isCustomCurrencyCorrect
  }

  public defaultMessage(args: ValidationArguments): string {
    return `(${JSON.stringify(args.value)}) is not a valid Money object`
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
  // TODO: refine `object` type
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (object: object, propertyName: string): void => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [settings],
      validator: IsMoneyValidator,
    })
  }
}
