"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  const formId = React.useId();
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
      <SheetContent className="w-full p-0 sm:max-w-lg">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Add your delivery details. Required fields are marked with an
            asterisk.
          </SheetDescription>
        </SheetHeader>
        <form
          id={formId}
          className="space-y-5 overflow-y-auto px-5 py-5"
          onSubmit={handleSubmit}
        >
          <section className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">Contact</h3>
              <p className="text-xs text-muted-foreground">
                Enter the name for this delivery address.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="John Doe"
                autoComplete="name"
                required
              />
            </div>
          </section>

          <section className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">Address</h3>
              <p className="text-xs text-muted-foreground">
                Use your complete street address for accurate delivery.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                Street Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="123 Main St, Apt 4B"
                autoComplete="street-address"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  autoComplete="address-level2"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">
                  State <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  autoComplete="address-level1"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip">
                ZIP Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="zip"
                value={formData.zip}
                onChange={(e) => handleChange("zip", e.target.value)}
                inputMode="numeric"
                autoComplete="postal-code"
                required
              />
            </div>
          </section>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="defaulte"
                checked={formData.defaulte}
                onCheckedChange={(checked) =>
                  handleChange("defaulte", Boolean(checked))
                }
              />
              <Label htmlFor="defaulte" className="cursor-pointer font-medium">
                Set as default address
              </Label>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              This address will be selected automatically at checkout.
            </p>
          </div>
        </form>
        <SheetFooter className="border-t px-5 py-4 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form={formId}>
            Save Address
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
