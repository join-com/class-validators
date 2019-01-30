import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator'
import { getRepository } from 'typeorm'

interface IObject {
  [key: string]: any
}

@ValidatorConstraint({ async: true, name: 'IsFrozenWhenPreset' })
export class IsFrozenWhenPresetConstraint implements ValidatorConstraintInterface {
  public async validate(value: any, args: ValidationArguments) {
    const { targetName, property } = args

    const repository = getRepository(targetName)
    const object: IObject = args.object
    const entity: IObject | undefined = await repository.findOne(object.id)

    return !entity || !entity[property] || entity[property] === value
  }
}

export const IsFrozenWhenPreset = () => {
  const options: ValidationOptions = {
    message: 'Value is not allowed to be changed'
  }

  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: IsFrozenWhenPresetConstraint
    })
  }
}
