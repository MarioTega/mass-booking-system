import {z} from 'zod';
export const schema= z.looseObject({
    firstName: z.string()
    .min(2, "Name must be at least 2 characters")
    .regex(/^([^0-9]*)$/, "First name cannot contain numbers"),
    lastName: z.string()
    .min(2, "Name must be at least 2 characters")
    .regex(/^([^0-9]*)$/, "Last name cannot contain numbers"),
    phoneNo: z.string()
    .min(11, "Phone number is too short")
    .regex(/^[0-9]+$/, "Phone number must contain only numbers"),
})