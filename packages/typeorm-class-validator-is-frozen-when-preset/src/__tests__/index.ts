import {
  Column,
  Connection,
  Entity,
  PrimaryGeneratedColumn,
  Repository,
  createConnection,
  getRepository,
} from 'typeorm'
import { IsFrozenWhenPreset } from '..'
import { validate } from 'class-validator'

@Entity()
class User {
  @PrimaryGeneratedColumn()
  public id!: number

  @IsFrozenWhenPreset()
  @Column({ type: 'int', nullable: true })
  public companyId?: number
}

let connection: Connection
let repo: Repository<User>

describe('IsFrozenWhenPreset', () => {
  beforeAll(async () => {
    connection = await createConnection({
      type: 'sqlite',
      database: `${__dirname}/testdb`,
      entities: [User],
      synchronize: true,
    })
    repo = getRepository(User)
  })

  afterAll(async () => {
    await connection.close()
  })

  afterEach(async () => {
    await connection.query('DELETE FROM user')
  })

  it('passes unless entity has values preset', async () => {
    const entityAttrs = repo.create()
    const entity = await repo.save(entityAttrs)

    entity.companyId = 1

    const validationErrors = await validate(entity)
    expect(validationErrors).toHaveLength(0)
  })

  it('passes when entity is new', async () => {
    const entityAttrs = repo.create({ companyId: 1 })
    await repo.save(entityAttrs)

    const newEntity = repo.create()

    const validationErrors = await validate(newEntity)
    expect(validationErrors).toHaveLength(0)
  })

  it('fails when preset value changed', async () => {
    const entityAttrs = repo.create({ companyId: 1 })
    const entity = await repo.save(entityAttrs)

    entity.companyId = 2

    const validationErrors = await validate(entity)
    expect(validationErrors).toHaveLength(1)
    expect(validationErrors[0]).toEqual(
      expect.objectContaining({
        property: 'companyId',
        constraints: {
          IsFrozenWhenPreset: 'Value is not allowed to be changed',
        },
      }),
    )
  })
})
