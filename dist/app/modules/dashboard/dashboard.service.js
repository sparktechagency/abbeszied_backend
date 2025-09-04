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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const user_models_1 = require("../user/user.models");
// Helper array to map months
const monthsOfYear = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const userGraph = (year, role) => __awaiter(void 0, void 0, void 0, function* () {
    // Get the start and end date for the given year
    const startOfYear = new Date(`${year}-01-01T00:00:00Z`);
    const endOfYear = new Date(`${year + 1}-01-01T00:00:00Z`);
    // Build the query to filter by role (if provided)
    const matchCondition = {
        createdAt: {
            $gte: startOfYear, // Filter users who joined on or after the start of the year
            $lt: endOfYear, // Filter users who joined before the start of the next year
        },
    };
    if (role) {
        matchCondition.role = role; // Filter by role if it's provided
    }
    // Execute the aggregation query using 'createdAt' and filtering by year and role
    const result = yield user_models_1.User.aggregate([
        {
            $match: matchCondition, // Apply the dynamic match condition
        },
        {
            $project: {
                month: { $month: '$createdAt' }, // Extract the month from 'createdAt'
                role: 1, // Include the role field
            },
        },
        {
            $group: {
                _id: { month: '$month', role: '$role' },
                count: { $sum: 1 },
            },
        },
        {
            $sort: { '_id.month': 1 }, // Sort by month
        },
    ]);
    // Initialize counts for each month (default to 0)
    const counts = {};
    for (let i = 1; i <= 12; i++) {
        counts[i] = { coachCount: 0, clientCount: 0 };
    }
    // Populate counts with actual data from aggregation
    result.forEach((item) => {
        const { month, role } = item._id;
        const count = item.count;
        if (role === 'coach') {
            counts[month].coachCount = count;
        }
        else if (role === 'client') {
            counts[month].clientCount = count;
        }
    });
    // Prepare the response with month names
    const response = monthsOfYear.map((monthName, index) => ({
        [monthName.toLowerCase()]: {
            coach_count: counts[index + 1].coachCount,
            client_count: counts[index + 1].clientCount,
        },
    }));
    return response;
});
const getDashboardStats = () => __awaiter(void 0, void 0, void 0, function* () {
    // Execute the aggregation query to count users and calculate revenue by role
    const result = yield user_models_1.User.aggregate([
        {
            $group: {
                _id: { role: '$role' },
                totalUsers: { $sum: 1 },
                totalRevenue: { $sum: '$revenue' },
            },
        },
    ]);
    const stats = {
        totalTrainee: 0,
        totalCoaches: 0,
        totalCorporate: 0,
        totalRevenue: 0,
    };
    result.forEach((item) => {
        switch (item._id.role) {
            case 'client':
                stats.totalTrainee = item.totalUsers;
                break;
            case 'coach':
                stats.totalCoaches = item.totalUsers;
                break;
            case 'corporate':
                stats.totalCorporate = item.totalUsers;
                break;
        }
        stats.totalRevenue += item.totalRevenue;
    });
    return stats;
});
exports.DashboardService = {
    userGraph,
    getDashboardStats
};
