import { payloadFetch } from "@/lib/payload-client";
import type { Address, AddressInput } from "@/types/address";

type PayloadDocs<T> = {
  docs: T[];
};

type PayloadAddress = Address & { _id?: string };

const normalizeAddress = (address: PayloadAddress): Address => ({
  ...address,
  id: address.id || address._id || "",
});

const fetchUserAddresses = async (): Promise<Address[]> => {
  const response =
    await payloadFetch<PayloadDocs<PayloadAddress>>("/api/customer-addresses/me");
  return (response.docs || []).map(normalizeAddress);
};

export const getUserAddresses = async () => fetchUserAddresses();

export const addAddress = async (
  _userId: string,
  input: AddressInput
): Promise<{ addresses: Address[]; message: string }> => {
  await payloadFetch<PayloadAddress>("/api/customer-addresses/me", {
    method: "POST",
    body: {
      name: input.name,
      address: input.address,
      city: input.city,
      state: input.state,
      zip: input.zip,
      defaulte: input.defaulte,
    },
  });

  const addresses = await fetchUserAddresses();
  return { addresses, message: "Address added successfully" };
};

export const updateAddress = async (
  _userId: string,
  addressId: string,
  input: AddressInput
): Promise<{ addresses: Address[]; message: string }> => {
  await payloadFetch<PayloadAddress>(`/api/customer-addresses/me`, {
    method: "PATCH",
    body: {
      addressId,
      name: input.name,
      address: input.address,
      city: input.city,
      state: input.state,
      zip: input.zip,
      defaulte: input.defaulte,
    },
  });

  const addresses = await fetchUserAddresses();
  return { addresses, message: "Address updated successfully" };
};

export const deleteAddress = async (
  _userId: string,
  addressId: string
): Promise<{ addresses: Address[]; message: string }> => {
  await payloadFetch<void>(`/api/customer-addresses/me`, {
    method: "DELETE",
    body: { addressId },
  });
  const addresses = await fetchUserAddresses();
  return { addresses, message: "Address deleted successfully" };
};
