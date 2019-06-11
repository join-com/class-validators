# Is frozen when preset validator for `class-validator` and `typeorm`

It validates that a field can not be changed once it was set before.

## Installation

```
npm install @join-com/typeorm-class-validator-is-frozen-when-preset --save
```

## Usage

You can use the validator as any other `class-validator`:

```ts
@Entity()
class User {
  @PrimaryGeneratedColumn()
  public id: number;

  // Raises a validation error when the field is updated
  @IsFrozenWhenPreset()
  @Column({ type: 'int', nullable: true })
  public companyId?: number;
}
```

