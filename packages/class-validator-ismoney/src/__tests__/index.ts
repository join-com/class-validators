import 'jest-extended'

import { IsMoney } from '..'
import { validate } from 'class-validator'

type FlakyPriceType =
  | number
  | string
  | {
      amount?: number | string
      currency?: string
    }

describe('IsMoney validation', () => {
  class GuineaPig {
    @IsMoney({ max: 1200 })
    public price?: FlakyPriceType
  }

  class CustomGuineaPig {
    @IsMoney({
      allowNegative: true,
      min: -1100,
      currencies: ['EUR', 'USD', 'CHF'],
    })
    public price?: FlakyPriceType
  }

  class DefaultGuineaPig {
    @IsMoney()
    public price?: FlakyPriceType
  }

  it('accepts valid class', async () => {
    const littlePiggy = new GuineaPig()
    littlePiggy.price = {
      amount: 42,
      currency: 'CHF',
    }
    expect.assertions(1)

    const validationResult = await validate(littlePiggy)
    expect(validationResult).toBeEmpty()
  })

  it('rejects invalid class', async () => {
    const littlePiggy = new GuineaPig()
    littlePiggy.price = {
      amount: 'Enough',
      currency: 'Gold',
    }
    expect.assertions(1)
    const validationResult = await validate(littlePiggy)
    expect(validationResult).toMatchSnapshot()
  })

  it('checks max', async () => {
    const littlePiggy = new GuineaPig()
    littlePiggy.price = {
      amount: 2400,
      currency: 'EUR',
    }
    const errors = await validate(littlePiggy)
    expect(errors).toMatchSnapshot()
  })

  it('rejects negative by default', async () => {
    const littlePiggy = new GuineaPig()
    littlePiggy.price = {
      amount: -2400,
      currency: 'EUR',
    }

    const errors = await validate(littlePiggy)
    expect(errors).toMatchSnapshot()
  })

  it('accepts negative amount when allowNegative is true', async () => {
    const littlePiggy = new CustomGuineaPig()
    littlePiggy.price = {
      amount: -100,
      currency: 'EUR',
    }

    const errors = await validate(littlePiggy)
    expect(errors).toHaveLength(0)
  })

  it('checks min', async () => {
    const littlePiggy = new CustomGuineaPig()
    littlePiggy.price = {
      amount: -2000,
      currency: 'USD',
    }

    const errors = await validate(littlePiggy)
    expect(errors).toMatchSnapshot()
  })

  it('rejects currency which is not in the custom list', async () => {
    const littlePiggy = new CustomGuineaPig()
    littlePiggy.price = {
      amount: 100,
      currency: 'BYN',
    }

    const errors = await validate(littlePiggy)
    expect(errors).toMatchSnapshot()
  })

  it('rejects incorrect values on default settings', async () => {
    const defaultPiggy = new DefaultGuineaPig()
    defaultPiggy.price = {
      amount: -100,
      currency: 'EUR',
    }
    const errors = await validate(defaultPiggy)
    expect(errors).toMatchSnapshot()
  })

  it('accept correct values on default settings', async () => {
    const defaultPiggy = new DefaultGuineaPig()
    defaultPiggy.price = {
      amount: -100,
      currency: 'EUR',
    }
    const errors = await validate(defaultPiggy)
    expect(errors).toMatchSnapshot()
  })

  it('rejects correclty on undefined value', async () => {
    const littlePiggy = new GuineaPig()
    littlePiggy.price = undefined
    const errors = await validate(littlePiggy)
    expect(errors).toMatchSnapshot()
  })
})
