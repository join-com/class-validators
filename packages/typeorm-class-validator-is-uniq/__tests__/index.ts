import { validate } from 'class-validator';
import {
  Column,
  Connection,
  createConnection,
  Entity,
  getRepository,
  PrimaryGeneratedColumn,
  Repository,
} from 'typeorm';
import { IsUniq } from '../src/index';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  public id: string;

  @IsUniq()
  @Column()
  public email: string;
}

let connection: Connection;
let repo: Repository<User>;

beforeAll(async () => {
  connection = await createConnection({
    type: 'sqlite',
    database: `${__dirname}/testdb`,
    entities: [User],
    synchronize: true,
  });
  repo = getRepository(User);
});

afterAll(() => connection.close());

const email = 'john@example.com'

beforeEach(async () => {
  const entities = [
    repo.create({ email: 'joe@example.com' }),
    repo.create({ email })
  ]
  await repo.save(entities);
});

afterEach(async () => {
  await repo.delete({});
});

describe('IsUniq', () => {
  it('raises an error when new entity', async () => {
    const entity = repo.create({ email });
    expect(await validate(entity)).toMatchInlineSnapshot(`
Array [
  ValidationError {
    "children": Array [],
    "constraints": Object {
      "IsUniq": "User with john@example.com already exists",
    },
    "property": "email",
    "target": User {
      "email": "john@example.com",
    },
    "value": "john@example.com",
  },
]
`);
  });

  it('raises no error when new entity', async () => {
    const entity = await repo.findOne({ email });
    const errors = await validate(entity);
    expect(errors).toHaveLength(0);
  });
});
