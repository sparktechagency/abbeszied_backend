import mongoose from 'mongoose';
import config from '../config';
import bcrypt from 'bcrypt';
import { USER_ROLE } from '../modules/user/user.constants';
import { User } from '../modules/user/user.models';
import { logger } from '../utils/logger';


const usersData = [
     {
          fullName: 'Administrator',
          email: config.super_admin.email,
          role: USER_ROLE.SUPER_ADMIN,
          password: config.super_admin.password, // No need to hash here
          verified: true,
     },
];

// Function to hash password
const hashPassword = async (password: string) => {
     const salt = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));
     return await bcrypt.hash(password, salt);
};

// Function to seed users
const seedUsers = async () => {
     try {
          await User.deleteMany();
          const hashedUsersData = await Promise.all(
               usersData.map(async (user: any) => {
                    const hashedPassword = await hashPassword(user.password);
                    return { ...user, password: hashedPassword };
               }),
          );
          await User.insertMany(hashedUsersData);
          console.log('Users seeded successfully!');
     } catch (err) {
          console.error('Error seeding users:', err);
     }
};

// // Function to seed categories

// Main seeding function
const seedSuperAdmin = async () => {
     try {
          console.log('--------------> Database seeding start <--------------');
          await seedUsers();
          // await seedCategories(); // Seed categories after users
          console.log('--------------> Database seeding completed <--------------');
     } catch (error) {
          logger.error('Error creating Super Admin:', error);
     } finally {
          mongoose.disconnect();
     }
};

// Connect to MongoDB and run the seeding
mongoose
     .connect(config.database_url as string)
     .then(() => seedSuperAdmin())
     .catch((err) => console.error('Error connecting to MongoDB:', err));
