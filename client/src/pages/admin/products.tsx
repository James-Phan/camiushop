import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ProductWithDetails, Category } from "@/lib/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ArrowUpDown,
} from "lucide-react";

export default function AdminProducts() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("name-asc");
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  // Fetch products
  const { data: products, isLoading } = useQuery<ProductWithDetails[]>({
    queryKey: ["/api/products"],
  });

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setProductToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete product: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filter and sort products
  const filteredProducts = products
    ? products
        .filter((product) => {
          const matchesSearch = product.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const matchesCategory = categoryFilter && categoryFilter !== "all"
            ? product.categoryId === parseInt(categoryFilter)
            : true;
          return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
          switch (sortBy) {
            case "name-asc":
              return a.name.localeCompare(b.name);
            case "name-desc":
              return b.name.localeCompare(a.name);
            case "price-asc":
              return (a.salePrice || a.price) - (b.salePrice || b.price);
            case "price-desc":
              return (b.salePrice || b.price) - (a.salePrice || a.price);
            case "stock-asc":
              return a.stock - b.stock;
            case "stock-desc":
              return b.stock - a.stock;
            default:
              return 0;
          }
        })
    : [];

  const handleDeleteProduct = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete);
    }
  };

  return (
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-poppins font-bold text-2xl">Product Management</h1>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" /> Add New Product
            </Link>
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              Manage your product catalog, edit details, and control inventory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative w-full sm:w-1/2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-4 w-full sm:w-1/2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                    <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                    <SelectItem value="stock-asc">Stock (Low to High)</SelectItem>
                    <SelectItem value="stock-desc">Stock (High to Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Image</TableHead>
                      <TableHead>
                        <div className="flex items-center cursor-pointer"
                             onClick={() => setSortBy(sortBy === "name-asc" ? "name-desc" : "name-asc")}>
                          Product
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>
                        <div className="flex items-center cursor-pointer"
                             onClick={() => setSortBy(sortBy === "price-asc" ? "price-desc" : "price-asc")}>
                          Price
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center cursor-pointer"
                             onClick={() => setSortBy(sortBy === "stock-asc" ? "stock-desc" : "stock-asc")}>
                          Stock
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          {categories?.find((c) => c.id === product.categoryId)?.name || "-"}
                        </TableCell>
                        <TableCell>
                          {product.salePrice ? (
                            <>
                              <span className="font-medium">${product.salePrice.toFixed(2)}</span>
                              <span className="text-muted-foreground line-through ml-2">
                                ${product.price.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="font-medium">${product.price.toFixed(2)}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              product.stock > 10
                                ? "bg-green-100 text-green-800"
                                : product.stock > 0
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.stock} in stock
                          </span>
                        </TableCell>
                        <TableCell>
                          {product.stock > 0 ? (
                            <span className="text-green-600">Active</span>
                          ) : (
                            <span className="text-red-600">Out of Stock</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/products/${product.id}`}>
                                  <Eye className="mr-2 h-4 w-4" /> View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/products/${product.id}`}>
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setProductToDelete(product.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No products found matching your criteria.</p>
                <Button asChild>
                  <Link href="/admin/products/new">Add New Product</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={productToDelete !== null} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
