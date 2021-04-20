import { Not, ObjectLiteral, Repository, getRepository } from 'typeorm'

import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator'

export type ScopedValidationOptions = ValidationOptions & { scope?: string[] }

@ValidatorConstraint({ async: true, name: 'IsUniq' })
export class IsUniqConstraint implements ValidatorConstraintInterface {
  public async validate(
    value: unknown,
    args: ValidationArguments,
  ): Promise<boolean> {
    if (args.value == null) {
      return true
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    const repository = getRepository<ObjectLiteral>(args.targetName)
    const entity = await repository.findOne({
      where: this.buildConditions(value, args, repository),
    })

    return !entity
  }

  private buildConditions(
    value: unknown,
    args: ValidationArguments,
    repository: Repository<ObjectLiteral>,
  ) {
    return {
      [args.property]: value,
      ...this.buildScopeConditions(args.object, args.constraints),
      ...this.buildPrimaryColumnConditions(args.object, repository),
    }
  }

  private buildScopeConditions(object: ObjectLiteral, constraints?: string[]) {
    if (!constraints || !constraints.length) {
      return {}
    }
    return constraints.reduce(
      (acc, key) => ({
        ...acc,
        // TODO: Refine types here
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [key]: object[key],
      }),
      {},
    )
  }

  private buildPrimaryColumnConditions(
    object: ObjectLiteral,
    repository: Repository<ObjectLiteral>,
  ) {
    const primaryColumnNames = repository.metadata.primaryColumns.map(
      ({ propertyName }) => propertyName,
    )

    if (!primaryColumnNames.length) {
      return {}
    }
    return primaryColumnNames.reduce((acc, name) => {
      // TODO: Refine types here
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const pkValue = object[name]
      return pkValue ? { ...acc, [name]: Not(pkValue) } : acc
    }, {})
  }
}

/**
 * Checks if a value is uniq across all records in a database or inside a scope.
 *
 * @param validationOptions accept `scope` options and all `class-validator` options
 */
export const IsUniq = (validationOptions?: ScopedValidationOptions) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (object: object, propertyName: string): void => {
    const scope = validationOptions && validationOptions.scope
    const opts: ScopedValidationOptions = {
      message: scope
        ? `$target with $property '$value' already exists in scope: ${scope.join(
            ', ',
          )}`
        : "$target with $property '$value' already exists",
      ...validationOptions,
    }
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: opts,
      constraints: scope || [],
      validator: IsUniqConstraint,
    })
  }
}
