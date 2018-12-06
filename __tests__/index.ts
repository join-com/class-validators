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

  @IsUniq({ scope: ['company'] })
  @Column({ nullable: true })
  public department: string;

  @Column({ nullable: true })
  public company: string;
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

describe('IsUniq', () => {
  describe('basic validation', () => {
    const EMAIL = 'john@example.com';

    beforeEach(async () => {
      const entity = repo.create({ email: EMAIL });
      await repo.save(entity);
    });

    afterEach(async () => {
      await repo.delete({});
    });

    it('raises an error when new entity', async () => {
      const entity = repo.create({ email: EMAIL });
      expect(await validate(entity)).toMatchInlineSnapshot(`
Array [
  ValidationError {
    "children": Array [],
    "constraints": Object {
      "IsUniq": "User with email: 'john@example.com' already exists",
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

    it('raises no error when same entity', async () => {
      const entity = repo.findOne({ email: EMAIL });
      const errors = await validate(entity);
      expect(errors).toHaveLength(0);
    });
  });

  describe('scoped validation', () => {
    const EMAIL = 'john@example.com';

    beforeEach(async () => {
      const entity = repo.create({
        email: EMAIL,
        department: 'IT',
        company: 'JOIN',
      });
      await repo.save(entity);
    });

    afterEach(async () => {
      await repo.delete({});
    });

    it('raises an error when new entity', async () => {
      const entity = repo.create({
        email: 'other@example.com',
        department: 'IT',
        company: 'JOIN',
      });
      expect(await validate(entity)).toMatchInlineSnapshot(`
Array [
  ValidationError {
    "children": Array [],
    "constraints": Object {
      "IsUniq": "User with department: 'IT' already exists in scope: company",
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
`);
    });

    it('raises no errors when other company', async () => {
      const entity = repo.create({
        email: 'other@example.com',
        department: 'IT',
        company: 'example',
      });
      const errors = await validate(entity);
      expect(errors).toHaveLength(0);
    });

    it('raises no error when same entity', async () => {
      const entity = repo.findOne({
        email: EMAIL,
      });
      const errors = await validate(entity);
      expect(errors).toHaveLength(0);
    });
  });
});
