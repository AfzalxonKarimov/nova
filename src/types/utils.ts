/**
 * Generic utility types used across NOVA.
 */

/** A value that can be T or null */
export type Nullable<T> = T | null;

/** Deep partial — every field optional, recursively */
export type DeepPartial<T> = {
  [K in keyof T]?: T extends object ? DeepPartial<T[K]> : T;
};

/** A UUID string (branded type for type-safety) */
export type UUID = string & { readonly __brand: unique symbol };

/** A timestamp (milliseconds since epoch) */
export type Timestamp = number;
