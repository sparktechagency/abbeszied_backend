"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userManagmentValidations = void 0;
const zod_1 = require("zod");
const updateStatus = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['active', 'blocked'], {
            errorMap: () => {
                return {
                    message: 'Invalid status. Valid values are "active" or "blocked".',
                };
            },
        }),
    }),
});
exports.userManagmentValidations = {
    updateStatus,
};
