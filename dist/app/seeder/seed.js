"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../config"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_constants_1 = require("../modules/user/user.constants");
const user_models_1 = require("../modules/user/user.models");
const logger_1 = require("../utils/logger");
const usersData = [
    {
        fullName: 'Super Admin',
        email: config_1.default.super_admin.email,
        role: user_constants_1.USER_ROLE.SUPER_ADMIN,
        password: config_1.default.super_admin.password, // No need to hash here
        verified: true,
    },
];
// Function to hash password
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const salt = yield bcrypt_1.default.hash(password, Number(config_1.default.bcrypt_salt_rounds));
    return yield bcrypt_1.default.hash(password, salt);
});
// Function to seed users
const seedUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield user_models_1.User.deleteMany();
        const hashedUsersData = yield Promise.all(usersData.map((user) => __awaiter(void 0, void 0, void 0, function* () {
            const hashedPassword = yield hashPassword(user.password);
            return Object.assign(Object.assign({}, user), { password: hashedPassword });
        })));
        yield user_models_1.User.insertMany(hashedUsersData);
        console.log('Users seeded successfully!');
    }
    catch (err) {
        console.error('Error seeding users:', err);
    }
});
// // Function to seed categories
// Main seeding function
const seedSuperAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('--------------> Database seeding start <--------------');
        yield seedUsers();
        // await seedCategories(); // Seed categories after users
        console.log('--------------> Database seeding completed <--------------');
    }
    catch (error) {
        logger_1.logger.error('Error creating Super Admin:', error);
    }
    finally {
        mongoose_1.default.disconnect();
    }
});
// Connect to MongoDB and run the seeding
mongoose_1.default
    .connect(config_1.default.database_url)
    .then(() => seedSuperAdmin())
    .catch((err) => console.error('Error connecting to MongoDB:', err));
