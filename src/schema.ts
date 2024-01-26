import { z } from "zod";

export const ingredient = /^(?:(filled|outlined|round|sharp|twotone):)?([a-z_-]+) *\+ *(?:(filled|outlined|round|sharp|twotone):)?([a-z_-]+) *$/i;
export const recipeSchema = z.record(
  z.record(z.string().regex(ingredient)).or(z.string().regex(ingredient))
);
export type Recipe = z.infer<typeof recipeSchema>;
