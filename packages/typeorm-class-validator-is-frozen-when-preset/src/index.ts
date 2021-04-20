import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator'
import { getRepository } from 'typeorm'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IObject = Record<string, any>

@ValidatorConstraint({ async: true, name: 'IsFrozenWhenPreset' })
export class IsFrozenWhenPresetConstraint
  implements ValidatorConstraintInterface {
  public async validate(
    value: unknown,
    args: ValidationArguments,
  ): Promise<boolean> {
    const object: IObject = args.object
    if (!object['id']) {
      return true
    }

    const { targetName, property } = args
    const repository = getRepository<IObject>(targetName)
    const entity = await repository.findOne(object['id'])

    return !entity || !entity[property] || entity[property] === value
  }
}

/**
 * Checks if a field can be set for a first time
 *
 * @param validationOptions `class-validator` options
 */
export const IsFrozenWhenPreset = (
  validationOptions?: ValidationOptions,
  // TODO: refine `object` type
  // eslint-disable-next-line @typescript-eslint/ban-types
): ((object: object, propertyName: string) => void) => {
  const options: ValidationOptions = {
    message: 'Value is not allowed to be changed',
    ...validationOptions,
  }

  // TODO: refine `object` type
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: IsFrozenWhenPresetConstraint,
    })
  }
}
