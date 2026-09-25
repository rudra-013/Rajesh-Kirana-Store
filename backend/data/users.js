import bcrypt from 'bcryptjs';

// In-memory users array (temporary storage, structured for easy DB migration)
const defaultHashedPassword = bcrypt.hashSync('password123', 10);

export const users = [
  {
    id: 'user_1',
    name: 'Rudra Gharaliya',
    email: 'rudra@example.com',
    phone: '9876543210',
    passwordHash: defaultHashedPassword,
    preferredLanguage: 'en',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  {
    id: 'user_2',
    name: 'Test Customer',
    email: 'customer@example.com',
    phone: '9876543211',
    passwordHash: defaultHashedPassword,
    preferredLanguage: 'gu',
    createdAt: new Date('2026-01-02T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  },
];

export default users;
