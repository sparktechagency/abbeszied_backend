import { z } from 'zod';

const createJobPostZodSchema = z.object({
  body: z.object({
    jobTitle: z.string({
      required_error: 'Job title is required',
    }),
    location: z.string({
      required_error: 'Location is required',
    }),
    jobCategory: z.string({
      required_error: 'Job category is required',
    }),
    jobType: z.string({
      required_error: 'Job type is required',
    }),
    jobDescription: z.string({
      required_error: 'Job description is required',
    }),
    qualifications: z.array(
      z.string({
        required_error: 'Qualification is required',
      })
    ),
    experience: z.string({
      required_error: 'Experience is required',
    }),
    salary: z.object({
      min: z.number({
        required_error: 'Minimum salary is required',
      }),
      max: z.number({
        required_error: 'Maximum salary is required',
      }),
      currency: z.string({
        required_error: 'Currency is required',
      }),
    }),
    benefits: z.array(
      z.string({
        required_error: 'Benefit is required',
      })
    ),
    howToApply: z.string({
      required_error: 'Application instructions are required',
    }),
    deadline: z.string({
      required_error: 'Deadline is required',
    }),
  }),
});

const updateJobPostZodSchema = z.object({
  body: z.object({
    jobTitle: z.string().optional(),
    location: z.string().optional(),
    jobCategory: z.string().optional(),
    jobType: z.string().optional(),
    jobDescription: z.string().optional(),
    qualifications: z.array(z.string()).optional(),
    experience: z.string().optional(),
    salary: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
      currency: z.string().optional(),
    }).optional(),
    benefits: z.array(z.string()).optional(),
    howToApply: z.string().optional(),
    deadline: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const JobPostValidation = {
  createJobPostZodSchema,
  updateJobPostZodSchema,
};