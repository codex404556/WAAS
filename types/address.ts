export type Address = {
  id: string;
  user?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  defaulte: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AddressInput = {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  defaulte: boolean;
};
