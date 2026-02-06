import { Address } from "@/types/cms";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { listAddresses } from "@/lib/cms";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

const DeleveryInfo = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    defaulte: false,
  });

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const data = await listAddresses();
      setAddresses(data);
      const defaultAddress = data.find((addr: Address) => addr.defaulte);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (data.length > 0) {
        setSelectedAddress(data[0]);
      }
    } catch (error) {
      console.log("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleFormChange = (field: keyof typeof formState, value: string | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const resolvePayloadUserId = async () => {
    const res = await fetch("/api/me", { credentials: "include" });
    if (!res.ok) {
      throw new Error("Failed to resolve user");
    }
    const data = (await res.json()) as { id?: string };
    return data.id ?? "";
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.id) {
      console.log("Missing Clerk user.");
      return;
    }
    setSaving(true);
    try {
      const payloadUserId = await resolvePayloadUserId();
      if (!payloadUserId) {
        throw new Error("Missing Payload user id");
      }
      const res = await fetch("/api/addresses/me", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: payloadUserId,
          ...formState,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create address");
      }
      await fetchAddresses();
      setIsAddOpen(false);
      setFormState({
        name: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        defaulte: false,
      });
    } catch (error) {
      console.log("Error creating address:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAddress = async (value: string) => {
    const addr = addresses?.find((a) => a._id === value);
    if (addr) setSelectedAddress(addr);

    try {
      await fetch("/api/addresses/me", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId: value }),
      });
      await fetchAddresses();
    } catch (error) {
      console.log("Error updating default address:", error);
    }
  };

  return (
    <div>
      {addresses && (
        <div className="bg-white mt-5 rounded-md">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedAddress?._id?.toString()}
                onValueChange={handleSelectAddress}
              >
                {!loading ? (
                  <>
                    {addresses?.map((address) => (
                      <div
                        key={address._id}
                        className={`flex items-center space-x-2 mb-4 cursor-pointer ${
                          selectedAddress?._id === address._id &&
                          "text-shop_dark_yellow"
                        }`}
                      >
                        <RadioGroupItem
                          id={`address-${address._id}`}
                          value={address._id.toString()}
                        />
                        <Label
                          htmlFor={`address-${address._id}`}
                          className="grid gap-1.5 flex-1"
                        >
                          <span className="font-semibold">{address.name}</span>
                          <span className="text-sm text-darkColor/50">
                            {address.address}, {address.city}, {address.state},{" "}
                            {address.zip}
                          </span>
                        </Label>
                      </div>
                    ))}{" "}
                  </>
                ) : (
                  <p className="text-lightColor font-semibold flex gap-2 items-center p-5 ">
                    <Loader2 className="w-5 h-5 text-shop_dark_yellow animate-spin" />
                    <span>Loding Addresses...</span>
                  </p>
                )}
              </RadioGroup>
              <Button variant="link" onClick={() => setIsAddOpen(true)}>
                Add new Address
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add new address</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="address-name">Address Name</Label>
              <Input
                id="address-name"
                value={formState.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                placeholder="Home, Office, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address-line">Address</Label>
              <Input
                id="address-line"
                value={formState.address}
                onChange={(e) => handleFormChange("address", e.target.value)}
                placeholder="Street and house number"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address-city">City</Label>
                <Input
                  id="address-city"
                  value={formState.city}
                  onChange={(e) => handleFormChange("city", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address-state">State</Label>
                <Input
                  id="address-state"
                  value={formState.state}
                  onChange={(e) => handleFormChange("state", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address-zip">Postal code</Label>
              <Input
                id="address-zip"
                value={formState.zip}
                onChange={(e) => handleFormChange("zip", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={formState.defaulte}
                onCheckedChange={(checked) =>
                  handleFormChange("defaulte", Boolean(checked))
                }
                id="address-default"
              />
              <Label htmlFor="address-default">Set as default</Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Address"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeleveryInfo;
