"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export type AddressFormData = {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  defaulte: boolean;
};

type AddressSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AddressFormData) => void;
  editingAddress?: AddressFormData | null;
  title: string;
};

export const AddressSheet: React.FC<AddressSheetProps> = ({
  open,
  onOpenChange,
  onSubmit,
  editingAddress,
  title,
}) => {
  const [formData, setFormData] = React.useState<AddressFormData>({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    defaulte: false,
  });

  React.useEffect(() => {
    if (editingAddress) {
      setFormData(editingAddress);
    } else if (!open) {
      setFormData({
        name: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        defaulte: false,
      });
    }
  }, [editingAddress, open]);

  const handleChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="zip">Zip</Label>
            <Input
              id="zip"
              value={formData.zip}
              onChange={(e) => handleChange("zip", e.target.value)}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="defaulte"
              checked={formData.defaulte}
              onCheckedChange={(checked) => handleChange("defaulte", Boolean(checked))}
            />
            <Label htmlFor="defaulte">Set as default</Label>
          </div>
          <Button type="submit" className="w-full">
            Save Address
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};
