# IsMoney validator for `class-validator`

Custom validator for [class-validator](https://github.com/typestack/class-validator)

It validates correctness of money type. Money type is represented as:

```ts
interface IMoney {
  currency: string;
  amount: number;
}
```

## Installation

```
npm install @join-com/class-validator-ismoney --save
```

## Usage

You can use the validator as any other `class-validator`:

```ts
class GuineaPig {
  @IsMoney({ max: 1200 })
  public price: any;
}

class CustomGuineaPig {
  @IsMoney({
    allowNegative: true,
    min: -1100,
    currencies: ['EUR', 'USD', 'CHF'],
  })
  public price: any;
}

class DefaultGuineaPig {
  @IsMoney()
  public price: any;
}
```

