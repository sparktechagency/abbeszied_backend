import mongoose from 'mongoose';
import config from '../config';
import { User } from '../modules/user/user.models';
import bcrypt from 'bcrypt';
// import Settings from '../modules/settings/settings.model';
// Sample demo data for users (with the provided user ID)

const usersData = [
  {
    fullName: 'Admin Test',
    email: 'admin@gmail.com',
    password: 'hello123',
    role: 'admin',
    phone: '01725541',
    image: '/uploads/profile/default-user.jpg',
  },
  {
    _id: new mongoose.Types.ObjectId('672df665d8413c73e3cb1a01'), // Provided user ID
    fullName: 'Business Test',
    email: 'business@gmail.com',
    password: 'hello123',
    role: 'business',
    phone: '01725541',
    image: '/uploads/profile/default-user.jpg',
  },
  {
    _id: new mongoose.Types.ObjectId('672df665d8413c63e3cb1b77'), // Provided user ID
    fullName: 'Sohag',
    email: 'sohag@gmail.com',
    password: 'hello123', // Use bcrypt for encryption in your model if needed
    role: 'user',
    phone: '0923982345',
    image: '/uploads/profile/default-user.jpg',
  },
  {
    _id: new mongoose.Types.ObjectId('672df665d8413c73e3cb1a02'), // Provided user ID
    fullName: 'User',
    email: 'user@gmail.com',
    password: 'hello123',
    role: 'user',
    phone: '0923982345',
    image: '/uploads/profile/default-user.jpg',
  },
];

const settingData = [
  {
    privacyPolicy: 'privacyPolicy',
    aboutUs: 'aboutUs',
    support: 'support',
    termsOfService: 'termsOfService',
  },
];

const rules = [
  {
    _id: new mongoose.Types.ObjectId('672df665d8413c73e3cb1301'),
    ownerId: new mongoose.Types.ObjectId('672df665d8413c73e3cb1a01'),
    text: 'Payments must be made via bank transfer or cash',
  },
  {
    _id: new mongoose.Types.ObjectId('672df665d8413c73e3cb1311'),
    ownerId: new mongoose.Types.ObjectId('672df665d8413c73e3cb1a01'),
    text: 'The parking spot is strictly for vehicle parking and cannot be used for storage or any other purpose.',
  },
  {
    _id: new mongoose.Types.ObjectId('672df665d8413c73e3cb1321'),
    ownerId: new mongoose.Types.ObjectId('672df665d8413c73e3cb1a01'),
    text: 'Keep the area clean and undamaged.',
  },
  {
    _id: new mongoose.Types.ObjectId('672df665d8413c73e3cb1331'),
    ownerId: new mongoose.Types.ObjectId('672df665d8413c73e3cb1a01'),
    text: 'Tenant is responsible for vehicle security.',
  },
];





// Function to drop the entire database
const dropDatabase = async () => {
  try {
    await mongoose.connection.dropDatabase();
    console.log('------------> Database dropped successfully! <------------');
  } catch (err) {
    console.error('Error dropping database:', err);
  }
};

const hashPassword = async (password: string) => {
  const salt = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));
  return await bcrypt.hash(password, salt);
};

// Function to seed users
const seedUsers = async () => {
  try {
    await User.deleteMany();
    const hashedUsersData = await Promise.all(
      usersData.map(async (user) => {
        const hashedPassword = await hashPassword(user.password);
        return { ...user, password: hashedPassword }; // Replace the password with the hashed one
      }),
    );
    await User.insertMany(hashedUsersData);

    console.log('Users seeded successfully!');
  } catch (err) {
    console.error('Error seeding users:', err);
  }
};

// const seedSettings = async () => {
//   try {
//     await Settings.deleteMany();

//     await Settings.insertMany(settingData);

//     console.log('Setting  seeded successfully!');
//   } catch (err) {
//     console.error('Error seeding setting:', err);
//   }
// };



// Connect to MongoDB
mongoose.connect(config.database_url as string);

// Call seeding functions
const seedDatabase = async () => {
  try {
    await dropDatabase();
    await seedUsers();

    console.log('--------------> Database seeding completed <--------------');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    mongoose.disconnect();
  }
};

// Execute seeding
seedDatabase();
