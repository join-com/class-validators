import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator'
import { getRepository, Not, Repository } from 'typeorm'

@ValidatorConstraint({ async: true, name: 'IsUniq' })
export class IsUniqConstraint implements ValidatorConstraintInterface {
  public async validate(value: any, args: ValidationArguments) {
    const repo = getRepository(args.targetName)

    const entity = await repo.findOne({
      where: this.buildConditions(value, args, repo)
    })

    return !entity
  }

  private buildConditions(
    value: any,
    args: ValidationArguments,
    repo: Repository<{}>
  ) {
    const primaryColumnNames = repo.metadata.primaryColumns.map(
      ({ propertyName }) => propertyName
    )
    let conditions = { [args.property]: value }
    if (primaryColumnNames.length) {
      conditions = primaryColumnNames.reduce((acc, name) => {
        const pkValue = (args.object as any)[name]
        return pkValue ? { acc, [name]: Not(pkValue) } : acc
      }, conditions)
    }
    return conditions
  }
}

export const IsUniq = (validationOptions?: ValidationOptions) => {
  return (object: object, propertyName: string) => {
    const opts: ValidationOptions = {
      message: '$target with $value already exists',
      ...validationOptions
    }
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: opts,
      constraints: [],
      validator: IsUniqConstraint
    })
  }
}
