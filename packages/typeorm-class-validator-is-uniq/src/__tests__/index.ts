import {
  Column,
  Connection,
  Entity,
  PrimaryGeneratedColumn,
  Repository,
  createConnection,
  getRepository,
} from 'typeorm'

import { IsUniq } from '../index'
import { validate } from 'class-validator'

@Entity()
class User {
  @PrimaryGeneratedColumn()
  public id!: string

  @IsUniq()
  @Column()
  public email!: string

  @IsUniq({ scope: ['company'] })
  @Column({ nullable: true })
  public department?: string

  @Column({ nullable: true })
  public company?: string
}

let connection: Connection
let repo: Repository<User>

beforeAll(async () => {
  connection = await createConnection({
    type: 'sqlite',
    database: `${__dirname}/testdb`,
    entities: [User],
    synchronize: true,
  })
  repo = getRepository(User)
})

afterAll(() => connection.close())

describe('IsUniq', () => {
  describe('basic validation', () => {
    const email = 'john@example.com'

    beforeEach(async () => {
      const entities = [
        repo.create({
          email: 'joe@example.com',
          department: 'sales',
          company: 'JOIN Solutions AG',
        }),
        repo.create({ email }),
      ]
      await repo.save(entities)
    })

    afterEach(async () => {
      await repo.delete({})
    })

    it('raises an error when new entity', async () => {
      const entity = repo.create({ email })
      expect(await validate(entity)).toMatchInlineSnapshot(`
Array [
  ValidationError {
    "children": Array [],
    "constraints": Object {
      "IsUniq": "User with email 'john@example.com' already exists",
    },
    "property": "email",
    "target": User {
      "email": "john@example.com",
    },
    "value": "john@example.com",
  },
]
`)
    })

    it('raises no error when same entity', async () => {
      const entity = await repo.findOneOrFail({ email })
      const errors = await validate(entity)
      expect(errors).toHaveLength(0)
    })
  })

  describe('handle nulls', () => {
    // TODO: some day, fix the null-undefined unification problem.

    const email = 'joe@example.com'
    beforeAll(async () => {
      const entities = [
        repo.create({
          email,
          // This is the result of conflating null & undefined. We use undefined to mark fields as optional, but TypeORM
          // expect null values instead.
          department: (null as unknown) as undefined,
          company: 'JOIN Solutions AG',
        }),
        repo.create({
          email: 'doe@example.com',
          // This is the result of conflating null & undefined. We use undefined to mark fields as optional, but TypeORM
          // expect null values instead.
          department: (null as unknown) as undefined,
          company: 'ACME',
        }),
      ]
      await repo.save(entities)
    })
    it('never consider null as unique value ', async () => {
      const entity = await repo.findOneOrFail({ email })
      const errors = await validate(entity)
      expect(errors).toHaveLength(0)
    })
  })
  describe('scoped validation', () => {
    const email = 'john@example.com'

    beforeEach(async () => {
      const entity = repo.create({
        email,
        department: 'IT',
        company: 'JOIN',
      })
      await repo.save(entity)
    })

    afterEach(async () => {
      await repo.delete({})
    })

    it('raises an error when new entity', async () => {
      const entity = repo.create({
        email: 'other@example.com',
        department: 'IT',
        company: 'JOIN',
      })
      expect(await validate(entity)).toMatchInlineSnapshot(`
Array [
  ValidationError {
    "children": Array [],
    "constraints": Object {
      "IsUniq": "User with department 'IT' already exists in scope: company",
    },
    "property": "department",
    "target": User {
      "company": "JOIN",
      "department": "IT",
      "email": "other@example.com",
    },
    "value": "IT",
  },
]
`)
    })

    it('raises no errors when other company', async () => {
      const entity = repo.create({
        email: 'other@example.com',
        department: 'IT',
        company: 'example',
      })
      const errors = await validate(entity)
      expect(errors).toHaveLength(0)
    })

    it('raises no error when same entity', async () => {
      const entity = repo.findOneOrFail({ email })
      const errors = await validate(entity)
      expect(errors).toHaveLength(0)
    })
  })
})
