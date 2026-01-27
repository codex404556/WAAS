/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { brandSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash, Plus, Loader2, RefreshCw } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";

type Brand = {
  _id: string;
  name: string;
  image?: string; // Image is optional
  createdAt: string;
};

type FormData = z.infer<typeof brandSchema>;

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const { checkIsAdmin } = useAuthStore();
  const isAdmin = checkIsAdmin();

  const formAdd = useForm<FormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      image: "", // Default to empty string for optional image
    },
  });

  const formEdit = useForm<FormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      image: "", // Default to empty string for optional image
    },
  });

  const fetchBrands = async () => {
    try {
      const response = await axiosPrivate.get("/brands");
      setBrands(response.data);
    } catch (error) {
      console.log("Failed to load brands", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load brands",
      });
    } finally {
      setLoading(false);
    }
  };

  // const handleRefresh = async () => {
  //   setRefreshing(true);
  //   try {
  //     const response = await axiosPrivate.get("/api/brands");
  //     setBrands(response.data);
  //     toast({
  //       title: "Success",
  //       description: "Brands refreshed successfully",
  //     });
  //   } catch (error) {
  //     console.log("Failed to refresh brands", error);
  //     toast({
  //       variant: "destructive",
  //       title: "Error",
  //       description: "Failed to refresh brands",
  //     });
  //   } finally {
  //     setRefreshing(false);
  //   }
  // };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await axiosPrivate.get("/brands");
      setBrands(response.data);
      toast({
        title: "Success",
        description: "Brands refreshed successfully",
      });
    } catch (error) {
      console.log("Failed to refresh brands", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh brands",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    formEdit.reset({
      name: brand.name,
      image: brand.image || "", // Ensure image is set or empty
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsDeleteModalOpen(true);
  };

  const handleAddBrand = async (data: FormData) => {
    setFormLoading(true);
    try {
      await axiosPrivate.post("/brands", data);
      toast({
        title: "Success",
        description: "Brand created successfully",
      });
      formAdd.reset();
      setIsAddModalOpen(false);
      fetchBrands();
    } catch (error) {
      console.log("Failed to create brand", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create brand",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateBrand = async (data: FormData) => {
    if (!selectedBrand) return;

    setFormLoading(true);
    try {
      await axiosPrivate.put(`/brands/${selectedBrand._id}`, data);
      toast({
        title: "Success",
        description: "Brand updated successfully",
      });
      setIsEditModalOpen(false);
      fetchBrands();
    } catch (error) {
      console.log("Failed to update brand", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update brand",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBrand = async () => {
    if (!selectedBrand) return;

    try {
      await axiosPrivate.delete(`/brands/${selectedBrand._id}`);
      toast({
        title: "Success",
        description: "Brand deleted successfully",
      });
      setIsDeleteModalOpen(false);
      fetchBrands();
    } catch (error) {
      console.log("Failed to delete brand", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete brand",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Brands</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          {isAdmin && (
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Brand
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Created At</TableHead>
                {isAdmin && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand._id}>
                  <TableCell>
                    {brand.image ? (
                      <div className="h-12 w-12 rounded overflow-hidden bg-muted">
                        <img
                          src={brand.image}
                          alt={brand.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>
                    {new Date(brand.createdAt).toLocaleDateString()}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(brand)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(brand)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {brands.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 4 : 3}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No brands found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Brand Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Brand</DialogTitle>
            <DialogDescription>Create a new product brand</DialogDescription>
          </DialogHeader>
          <Form {...formAdd}>
            <form
              onSubmit={formAdd.handleSubmit(handleAddBrand)}
              className="space-y-4"
            >
              <FormField
                control={formAdd.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formAdd.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Image (Optional)</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Brand"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Brand Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
            <DialogDescription>Update brand information</DialogDescription>
          </DialogHeader>
          <Form {...formEdit}>
            <form
              onSubmit={formEdit.handleSubmit(handleUpdateBrand)}
              className="space-y-4"
            >
              <FormField
                control={formEdit.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={formLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formEdit.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Image (Optional)</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        disabled={formLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Brand"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Brand Confirmation */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              brand <span className="font-semibold">{selectedBrand?.name}</span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBrand}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
