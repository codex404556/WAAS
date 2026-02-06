import { addAddress, deleteAddress, updateAddress } from "@/lib/addressApi";
import { useUser } from "@clerk/nextjs";
import type { Address, AddressInput } from "@/types/address";
import React, { useEffect, useState } from "react";
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

  // Update form when dialog opens
  useEffect(() => {
    if (isAddDialogOpen) {
      resetForm();
    }
  }, [isAddDialogOpen, addresses.length]);

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      defaulte: addresses.length === 0, // Auto-check if this is the first address
    });
  };

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
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Address
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Address</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddAddress} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="name"
                        className="text-sm font-medium text-gray-700"
                      >
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="John Doe"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="address"
                        className="text-sm font-medium text-gray-700"
                      >
                        Address *
                      </Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        placeholder="123 Main Street, Apt 4B"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="city"
                          className="text-sm font-medium text-gray-700"
                        >
                          City *
                        </Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          placeholder="New York"
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="state"
                          className="text-sm font-medium text-gray-700"
                        >
                          State *
                        </Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) =>
                            setFormData({ ...formData, state: e.target.value })
                          }
                          placeholder="CA"
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="zip"
                        className="text-sm font-medium text-gray-700"
                      >
                        Zip Code *
                      </Label>
                      <Input
                        id="zip"
                        value={formData.zip}
                        onChange={(e) =>
                          setFormData({ ...formData, zip: e.target.value })
                        }
                        placeholder="90210"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={formData.defaulte}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            defaulte: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Label
                        htmlFor="isDefault"
                        className="text-sm text-gray-700"
                      >
                        Set as default shipping address
                      </Label>
                    </div>
                    {addresses.length === 0 && (
                      <div className="mt-3 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                        💡 This will be your primary shipping address for future
                        orders
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Adding...
                        </>
                      ) : (
                        "Add Address"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      className="flex-1 sm:flex-none sm:min-w-[100px]"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
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
                        className="mt-1 flex-shrink-0"
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
                      <div className="flex flex-col sm:flex-row gap-1 flex-shrink-0">
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
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Address</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddAddress} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="123 Main St"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      placeholder="CA"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">Zip Code</Label>
                    <Input
                      id="zip"
                      value={formData.zip}
                      onChange={(e) =>
                        setFormData({ ...formData, zip: e.target.value })
                      }
                      placeholder="90210"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.defaulte}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          defaulte: e.target.checked,
                        })
                      }
                    />
                    <Label htmlFor="isDefault">Set as default address</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Adding..." : "Add Address"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Address</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEditAddress} className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name">Full Name</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-address">Address</Label>
                    <Input
                      id="edit-address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="123 Main St"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-city">City</Label>
                    <Input
                      id="edit-city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-state">State</Label>
                    <Input
                      id="edit-state"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      placeholder="CA"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-zip">Zip Code</Label>
                    <Input
                      id="edit-zip"
                      value={formData.zip}
                      onChange={(e) =>
                        setFormData({ ...formData, zip: e.target.value })
                      }
                      placeholder="90210"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-isDefault"
                      checked={formData.defaulte}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          defaulte: e.target.checked,
                        })
                      }
                    />
                    <Label htmlFor="edit-isDefault">
                      Set as default address
                    </Label>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Updating..." : "Update Address"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AddressSelection;
