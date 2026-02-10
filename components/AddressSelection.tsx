import { addAddress, deleteAddress, updateAddress } from "@/lib/addressApi";
import { useUser } from "@clerk/nextjs";
import type { Address, AddressInput } from "@/types/address";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Edit, MapPin, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { RadioGroup } from "@radix-ui/react-radio-group";
import { RadioGroupItem } from "./ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface AddressSelectionProps {
  selectedAddress: Address | null;
  onAddressSelect: (address: Address) => void;
  addresses: Address[];
  onAddressesUpdate: (addresses: Address[]) => void;
}

const AddressSelection: React.FC<AddressSelectionProps> = ({
  selectedAddress,
  onAddressSelect,
  addresses,
  onAddressesUpdate,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<AddressInput>({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    defaulte: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user, isLoaded, isSignedIn } = useUser();

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      defaulte: addresses.length === 0, // Auto-check if this is the first address
    });
  }, [addresses.length]);

  // Reset Add form each time the add-address dialog is opened.
  useEffect(() => {
    if (!isAddDialogOpen) return;
    resetForm();
  }, [isAddDialogOpen, resetForm]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !isSignedIn || !user) return;

    setIsLoading(true);
    try {
      const result = await addAddress(user.id, formData);
      onAddressesUpdate(result.addresses);
      toast.success(result.message);
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add address"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !isSignedIn || !user || !editingAddress) return;

    setIsLoading(true);
    try {
      const result = await updateAddress(user.id, editingAddress.id, formData);
      onAddressesUpdate(result.addresses);
      toast.success(result.message);
      setIsEditDialogOpen(false);
      setEditingAddress(null);
      resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update address"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!isLoaded || !isSignedIn || !user) return;

    setIsLoading(true);
    try {
      const result = await deleteAddress(user.id, addressId);
      onAddressesUpdate(result.addresses);
      toast.success(result.message);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete address"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      address: address.address,
      city: address.city,
      state: address.state,
      zip: address.zip,
      defaulte: address.defaulte,
    });
    setIsEditDialogOpen(true);
  };

  const handleFieldChange =
    (field: keyof AddressInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const renderAddressForm = ({
    mode,
    onSubmit,
    onCancel,
    fieldPrefix,
  }: {
    mode: "add" | "edit";
    onSubmit: (e: React.FormEvent) => Promise<void>;
    onCancel: () => void;
    fieldPrefix: string;
  }) => (
    <form onSubmit={onSubmit} className="space-y-5 px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor={`${fieldPrefix}-name`} className="text-sm font-medium">
            Full Name *
          </Label>
          <Input
            id={`${fieldPrefix}-name`}
            value={formData.name}
            onChange={handleFieldChange("name")}
            placeholder="John Doe"
            required
            className="mt-1 h-10"
          />
        </div>

        <div>
          <Label
            htmlFor={`${fieldPrefix}-address`}
            className="text-sm font-medium"
          >
            Address *
          </Label>
          <Input
            id={`${fieldPrefix}-address`}
            value={formData.address}
            onChange={handleFieldChange("address")}
            placeholder="123 Main Street, Apt 4B"
            required
            className="mt-1 h-10"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor={`${fieldPrefix}-city`} className="text-sm font-medium">
              City *
            </Label>
            <Input
              id={`${fieldPrefix}-city`}
              value={formData.city}
              onChange={handleFieldChange("city")}
              placeholder="New York"
              required
              className="mt-1 h-10"
            />
          </div>
          <div>
            <Label
              htmlFor={`${fieldPrefix}-state`}
              className="text-sm font-medium"
            >
              State *
            </Label>
            <Input
              id={`${fieldPrefix}-state`}
              value={formData.state}
              onChange={handleFieldChange("state")}
              placeholder="CA"
              required
              className="mt-1 h-10"
            />
          </div>
        </div>

        <div>
          <Label htmlFor={`${fieldPrefix}-zip`} className="text-sm font-medium">
            Zip Code *
          </Label>
          <Input
            id={`${fieldPrefix}-zip`}
            value={formData.zip}
            onChange={handleFieldChange("zip")}
            placeholder="90210"
            required
            className="mt-1 h-10"
          />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
        <div className="flex items-start gap-2.5">
          <input
            type="checkbox"
            id={`${fieldPrefix}-isDefault`}
            checked={formData.defaulte}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                defaulte: e.target.checked,
              }))
            }
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <Label
            htmlFor={`${fieldPrefix}-isDefault`}
            className="text-sm text-gray-700"
          >
            Set as default shipping address
          </Label>
        </div>
        {mode === "add" && addresses.length === 0 && (
          <p className="mt-2 text-xs text-blue-700">
            This will be your primary shipping address for future orders.
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-10 w-full sm:w-auto sm:min-w-[100px]"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="h-10 w-full sm:w-auto">
          {isLoading
            ? mode === "add"
              ? "Adding..."
              : "Updating..."
            : mode === "add"
              ? "Add Address"
              : "Update Address"}
        </Button>
      </div>
    </form>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Shipping Address</CardTitle>
      </CardHeader>
      <CardContent>
        {addresses?.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <MapPin className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No shipping address found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Add your shipping address to proceed with your order. This will be
              used for delivery.
            </p>
            {/* Add-address modal: controlled via `isAddDialogOpen` */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Address
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-[560px]">
                <DialogHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
                  <DialogTitle>Add New Address</DialogTitle>
                </DialogHeader>
                {renderAddressForm({
                  mode: "add",
                  onSubmit: handleAddAddress,
                  onCancel: () => setIsAddDialogOpen(false),
                  fieldPrefix: "first-add",
                })}
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <>
            {addresses?.length === 1 && (
              <div className="p-3 bg-green-50 border-gray-200 rounded-lg">
                <p className="text-sm text-gray-800">
                  ✓ Your address has been automatically selected for shipping
                </p>
              </div>
            )}
            <RadioGroup
              value={selectedAddress?.id || ""}
              onValueChange={(value) => {
                const address = addresses.find((addr) => addr.id === value);
                if (address) {
                  onAddressSelect(address);
                }
              }}
            >
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`relative p-4 border-2 rounded-xl transition-all duration-200 hover:shadow-md ${
                      selectedAddress?.id === address.id
                        ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Radio Button */}
                      <RadioGroupItem
                        value={address.id}
                        id={address.id}
                        className="mt-1 flex shrink-0"
                      />

                      {/* Address Content */}
                      <div className="flex-1 min-w-0">
                        <Label
                          htmlFor={address.id}
                          className="cursor-pointer block"
                        >
                          {/* Address Header */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="font-semibold text-gray-900">
                                Shipping Address
                              </span>
                            </div>
                            {address.defaulte && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ Default
                              </span>
                            )}
                          </div>

                          {/* Address Details */}
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900">
                              {address.name}
                            </div>
                            <div className="text-sm text-gray-600 flex flex-wrap gap-1">
                              <span>{address.address},</span>
                              <span>{address.city},</span>
                              <span>{address.state}</span>
                              <span>{address.zip}</span>
                            </div>
                          </div>
                        </Label>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(address)}
                          className="p-2 h-8 w-8 hover:bg-gray-100"
                          title="Edit Address"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAddress(address.id)}
                          disabled={isLoading}
                          className="p-2 h-8 w-8 hover:bg-red-50 hover:text-red-600"
                          title="Delete Address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Selected Indicator */}
                    {selectedAddress?.id === address.id && (
                      <div className="absolute top-2 right-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </RadioGroup>
            {/* Same add-address modal for users who already have addresses */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full mt-4 h-12 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Address
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-[560px]">
                <DialogHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
                  <DialogTitle>Add New Address</DialogTitle>
                </DialogHeader>
                {renderAddressForm({
                  mode: "add",
                  onSubmit: handleAddAddress,
                  onCancel: () => setIsAddDialogOpen(false),
                  fieldPrefix: "add",
                })}
              </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-[560px]">
                <DialogHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
                  <DialogTitle>Edit Address</DialogTitle>
                </DialogHeader>
                {renderAddressForm({
                  mode: "edit",
                  onSubmit: handleEditAddress,
                  onCancel: () => setIsEditDialogOpen(false),
                  fieldPrefix: "edit",
                })}
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AddressSelection;
