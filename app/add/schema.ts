import { z } from "zod";

export const productSchema = z.object({
  id: z.coerce.number().optional(),
  photo: z.string({
    required_error: "Photo is required.",
  }),
  title: z
    .string({
      required_error: "Title is required.",
    })
    .max(50),
  description: z.string({
    required_error: "Description is required.",
  }),
  price: z.coerce.number({
    required_error: "Price is required.",
  }),
});

export type ProductType = z.infer<typeof productSchema>;
