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

const EMAIL = 'john@example.com';

beforeEach(async () => {
  const entity = repo.create({ email: EMAIL });
  await repo.save(entity);
});

afterEach(async () => {
  await repo.delete({});
});

describe('IsUniq', () => {
  it('raises an error when new entity', async () => {
    const entity = repo.create({ email: EMAIL });
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
    const entity = repo.findOne({ email: EMAIL });
    const errors = await validate(entity);
    expect(errors).toHaveLength(0);
  });
});
