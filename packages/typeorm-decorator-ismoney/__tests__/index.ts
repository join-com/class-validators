import { validate } from 'class-validator';
import { IsMoney } from '../src';

describe('IsMoney validation', () => {
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

  it('accepts valid class', () => {
    const littlePiggy = new GuineaPig();
    littlePiggy.price = {
      amount: 42,
      currency: 'CHF',
    };
    expect.assertions(1);
    validate(littlePiggy).then(errors => {
      expect(errors).toBeEmpty();
    });
  });

  it('rejects invalid class', () => {
    const littlePiggy = new GuineaPig();
    littlePiggy.price = {
      amount: 'Enough',
      currency: 'Gold',
    };
    expect.assertions(1);
    validate(littlePiggy).then(errors => {
      expect(errors).toMatchSnapshot();
    });
  });

  it('checks max', async () => {
    const littlePiggy = new GuineaPig();
    littlePiggy.price = {
      amount: 2400,
      currency: 'EUR',
    };
    const errors = await validate(littlePiggy);
    expect(errors).toMatchSnapshot();
  });

  it('rejects negative by default', async () => {
    const littlePiggy = new GuineaPig();
    littlePiggy.price = {
      amount: -2400,
      currency: 'EUR',
    };

    const errors = await validate(littlePiggy);
    expect(errors).toMatchSnapshot();
  });

  it('accepts negative amount when allowNegative is true', async () => {
    const littlePiggy = new CustomGuineaPig();
    littlePiggy.price = {
      amount: -100,
      currency: 'EUR',
    };

    const errors = await validate(littlePiggy);
    expect(errors).toHaveLength(0);
  });

  it('checks min', async () => {
    const littlePiggy = new CustomGuineaPig();
    littlePiggy.price = {
      amount: -2000,
      currency: 'USD',
    };

    const errors = await validate(littlePiggy);
    expect(errors).toMatchSnapshot();
  });

  it('rejects currency which is not in the custom list', async () => {
    const littlePiggy = new CustomGuineaPig();
    littlePiggy.price = {
      amount: 100,
      currency: 'BYN',
    };

    const errors = await validate(littlePiggy);
    expect(errors).toMatchSnapshot();
  });
});
