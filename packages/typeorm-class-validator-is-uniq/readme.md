# IsUniq validator

Custom validator for [class-validator](https://github.com/typestack/class-validator) and [typeorm](https://typeorm.io)

It validates uniqueness of any value across all records in a database. The validation can be narrowed down to a scope based on another column.

## Installation

```
npm install @join-com/typeorm-class-validator-is-uniq --save
```

## Usage

You can use the validator as any other `class-validator`:

```ts
@Entity()
class User {
  @PrimaryGeneratedColumn()
  public id: string;

  // Validates uniqueness of an email across all records
  @IsUniq()
  @Column()
  public email: string;

  // Validates uniqueness of a department in scope of a company
  @IsUniq({ scope: ['company'] })
  @Column({ nullable: true })
  public department: string;

  @Column({ nullable: true })
  public company: string;
}
```

