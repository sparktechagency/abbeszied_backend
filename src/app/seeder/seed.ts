import mongoose from 'mongoose';
import config from '../config';
import { User } from '../modules/user/user.models';
import bcrypt from 'bcrypt';
import Rule from '../modules/rule/rule.model';
import Product from '../modules/product/product.model';
import Field from '../modules/field/field.model';
import Court from '../modules/parking/parking.model';
import CourtOffer from '../modules/courtOffer/courtOffer.model';
import Settings from '../modules/settings/settings.model';
import Parking from '../modules/parking/parking.model';
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

const parking = [
  {
    _id: new mongoose.Types.ObjectId('5555f665d8413c73e3cb1301'),
    ownerId: new mongoose.Types.ObjectId('672df665d8413c73e3cb1a01'),
    name: 'Gazipur Town Parking',
    spotType: 'Car & Truck',
    slot: 12,
    location: 'Gazipur',
    locationLatLong: {
      type: 'Point',
      coordinates: [90.39209453754904, 23.996765364872925],
    },
    daylyPrice: 50,
    weeklyPrice: 200,
    images: ['/uploads/parking/Frame_2147226074-1743656228697-551158985.png'],
    openTime: '07:45 AM',
    closeTime: '10:45 PM',
    rules: [
      '672df665d8413c73e3cb1301',
      '672df665d8413c73e3cb1311',
      '672df665d8413c73e3cb1321',
    ],
    description:
      'A designated parking spot available for rent, offering a secure and convenient place to park your vehicle.',
  },
  {
    _id: new mongoose.Types.ObjectId('6666f665d8413c73e3cb1301'),
    ownerId: new mongoose.Types.ObjectId('672df665d8413c73e3cb1a01'),
    name: 'Dhanmondi Parking',
    spotType: 'Car & Bus',
    slot: 12,
    location: 'Dhanmondi',
    locationLatLong: {
      type: 'Point',
      coordinates: [90.37632182348962, 23.748033057570463],
    },
    daylyPrice: 80,
    weeklyPrice: 400,
    images: ['/uploads/parking/Frame_2147226074-1743656228697-551158985.png'],
    openTime: '10:45 AM',
    closeTime: '11:45 PM',
    rules: [
      '672df665d8413c73e3cb1301',
      '672df665d8413c73e3cb1311',
      '672df665d8413c73e3cb1321',
    ],
    description:
      'A private parking space for rent, providing a safe and accessible spot for your vehicle.',
  },
];

const courts = [
  {
    _id: new mongoose.Types.ObjectId('672df665d8413c73e3cb1871'),
    fieldId: new mongoose.Types.ObjectId('672df665d8413c73e3cb8888'),
    ownerId: new mongoose.Types.ObjectId('672df665d8413c73e3cb1a01'),
    courtName: 'Elite Club',
    courtImages: ['/uploads/court/court1.png', '/uploads/court/court2.png'],
    courtPrice: 1200,
    blockStartTime: '11:45 AM',
    blockEndTime: '01:45 PM',
    courtType: 'Outdoor | Grass | Single',
    description: 'New court added',
  },
  {
    _id: new mongoose.Types.ObjectId('672df665d8413c73e3cb1371'),
    fieldId: new mongoose.Types.ObjectId('672df665d8413c73e3cb1361'),
    ownerId: new mongoose.Types.ObjectId('672df665d8413c73e3cb1a01'),
    courtName: 'Elite Vibes',
    courtImages: ['/uploads/court/court1.png', '/uploads/court/court2.png'],
    courtPrice: 600,
    blockStartTime: '11:45 AM',
    blockEndTime: '01:45 PM',
    courtType: 'Outdoor | Grass | Single',
    description: 'abc',
  },
];

const courtOffer = [
  {
    _id: new mongoose.Types.ObjectId('672df665d8413c73e3cb1381'),
    fieldId: new mongoose.Types.ObjectId('672df665d8413c73e3cb1361'),
    ownerId: new mongoose.Types.ObjectId('672df665d8413c73e3cb1a01'),
    courtId: new mongoose.Types.ObjectId('672df665d8413c73e3cb1371'),
    offerStartTime: '2025-03-06T10:00:00.000Z',
    offerEndTime: '2025-05-25T10:00:00.000Z',
    offerImages: ['/uploads/offerImage/offer1.png'],
    offerTitle: 'Vitory Day Greate Offer',
    discountAmount: 15,
    description: 'Greate Offer',
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

const seedSettings = async () => {
  try {
    await Settings.deleteMany();

    await Settings.insertMany(settingData);

    console.log('Setting  seeded successfully!');
  } catch (err) {
    console.error('Error seeding setting:', err);
  }
};

const seedRules = async () => {
  try {
    await Rule.deleteMany();

    await Rule.insertMany(rules);

    console.log('Rules seeded successfully!');
  } catch (err) {
    console.error('Error seeding rules:', err);
  }
};

const seedParking = async () => {
  try {
    await Parking.deleteMany();

    await Parking.insertMany(parking);

    console.log('Parking seeded successfully!');
  } catch (err) {
    console.error('Error seeding parking:', err);
  }
};

const seedCourts = async () => {
  try {
    await Court.deleteMany();

    await Court.insertMany(courts);

    console.log('Courts seeded successfully!');
  } catch (err) {
    console.error('Error seeding courts:', err);
  }
};

const seedCourtOffer = async () => {
  try {
    await CourtOffer.deleteMany();

    await CourtOffer.insertMany(courtOffer);

    console.log('Courts offer seeded successfully!');
  } catch (err) {
    console.error('Error seeding court offer:', err);
  }
};

// Connect to MongoDB
mongoose.connect(config.database_url as string);

// Call seeding functions
const seedDatabase = async () => {
  try {
    await dropDatabase();
    await seedUsers();
    await seedSettings();
    await seedRules();
    await seedParking();

    // await seedFields();
    // await seedCourts();
    // await seedCourtOffer();

    console.log('--------------> Database seeding completed <--------------');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    mongoose.disconnect();
  }
};

// Execute seeding
seedDatabase();
