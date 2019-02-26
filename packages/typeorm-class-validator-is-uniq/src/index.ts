import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { getRepository, Not, Repository } from 'typeorm';

@ValidatorConstraint({ async: true, name: 'IsUniq' })
export class IsUniqConstraint implements ValidatorConstraintInterface {
  public async validate(value: any, args: ValidationArguments) {
    const repository = getRepository(args.targetName);

    const entity = await repository.findOne({
      where: this.buildConditions(value, args, repository),
    });

    return !entity;
  }

  private buildConditions(
    value: any,
    args: ValidationArguments,
    repository: Repository<{}>,
  ) {
    const primaryColumnNames = repository.metadata.primaryColumns.map(
      ({ propertyName }) => propertyName,
    );
    let conditions = { [args.property]: value };
    if (primaryColumnNames.length) {
      conditions = primaryColumnNames.reduce((acc, name) => {
        const pkValue = (args.object as any)[name];
        return pkValue ? { ...acc, [name]: Not(pkValue) } : acc;
      }, conditions);
    }
    return conditions;
  }
}

export const IsUniq = (validationOptions?: ValidationOptions) => {
  return (object: object, propertyName: string) => {
    const opts: ValidationOptions = {
      message: '$target with $value already exists',
      ...validationOptions,
    };
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: opts,
      constraints: [],
      validator: IsUniqConstraint,
    });
  };
};
