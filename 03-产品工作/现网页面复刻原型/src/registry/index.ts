import { createPrototypeRegistry } from "./registry";
import { seedPrototypeRegistry } from "./seed";

export * from "./registry";
export * from "./types";

export const prototypeRegistry = seedPrototypeRegistry(createPrototypeRegistry());
