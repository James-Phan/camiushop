import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Order, User } from "@/lib/types";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  MoreHorizontal,
  Eye,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Package,
  Truck,
} from "lucide-react";

export default function AdminOrders() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  
  const itemsPerPage = 10;

  // Fetch all orders
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/orders/${id}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Order updated",
        description: "The order status has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      setIsStatusUpdateOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update order status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filter and sort orders
  const filteredOrders = orders
    ? orders
        .filter((order) => {
          const matchesSearch = order.id.toString().includes(searchTerm);
          const matchesStatus = statusFilter && statusFilter !== "all" ? order.status === statusFilter : true;
          return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
          switch (sortBy) {
            case "date-asc":
              return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case "date-desc":
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case "total-asc":
              return a.total - b.total;
            case "total-desc":
              return b.total - a.total;
            case "id-asc":
              return a.id - b.id;
            case "id-desc":
              return b.id - a.id;
            default:
              return 0;
          }
        })
    : [];

  // Pagination
  const totalPages = Math.ceil((filteredOrders?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  const handleOpenStatusUpdate = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsStatusUpdateOpen(true);
  };

  const handleUpdateStatus = () => {
    if (selectedOrder && newStatus) {
      updateOrderStatusMutation.mutate({
        id: selectedOrder.id,
        status: newStatus,
      });
    }
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-poppins font-bold text-2xl">Order Management</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              View and manage customer orders, update statuses, and process fulfillment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative w-full sm:w-1/2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-4 w-full sm:w-1/2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Date (Newest)</SelectItem>
                    <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                    <SelectItem value="total-desc">Total (High to Low)</SelectItem>
                    <SelectItem value="total-asc">Total (Low to High)</SelectItem>
                    <SelectItem value="id-desc">Order ID (Descending)</SelectItem>
                    <SelectItem value="id-asc">Order ID (Ascending)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading orders...</p>
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => setSortBy(sortBy === "id-asc" ? "id-desc" : "id-asc")}
                        >
                          Order ID
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => setSortBy(sortBy === "date-asc" ? "date-desc" : "date-asc")}
                        >
                          Date
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => setSortBy(sortBy === "total-asc" ? "total-desc" : "total-asc")}
                        >
                          Total
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>
                          {order.shippingAddress.fullName}
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                              order.status
                            )}`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {order.paymentMethod === "credit_card" 
                            ? "Credit Card"
                            : order.paymentMethod === "bank_transfer"
                            ? "Bank Transfer"
                            : "Cash on Delivery"}
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
                              <DropdownMenuItem onClick={() => handleViewOrderDetails(order)}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenStatusUpdate(order)}>
                                <Package className="mr-2 h-4 w-4" /> Update Status
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
                <p className="text-muted-foreground mb-4">No orders found matching your criteria.</p>
              </div>
            )}

            {/* Pagination */}
            {filteredOrders.length > itemsPerPage && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                      // Show first page, last page, current page, and pages around current
                      let pageToShow = i + 1;
                      
                      if (totalPages > 5) {
                        if (currentPage <= 3) {
                          // Near the start
                          pageToShow = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          // Near the end
                          pageToShow = totalPages - 4 + i;
                        } else {
                          // In the middle
                          pageToShow = currentPage - 2 + i;
                        }
                      }
                      
                      return (
                        <PaginationItem key={pageToShow}>
                          <PaginationLink
                            isActive={currentPage === pageToShow}
                            onClick={() => setCurrentPage(pageToShow)}
                          >
                            {pageToShow}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        className={
                          currentPage === totalPages ? "pointer-events-none opacity-50" : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              {selectedOrder ? `Order #${selectedOrder.id} - ${new Date(selectedOrder.createdAt).toLocaleDateString()}` : ''}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-sm mb-2">Shipping Information</h4>
                  <div className="bg-muted p-3 rounded-md text-sm">
                    <p className="font-medium">{selectedOrder.shippingAddress.fullName}</p>
                    <p>{selectedOrder.shippingAddress.addressLine1}</p>
                    {selectedOrder.shippingAddress.addressLine2 && (
                      <p>{selectedOrder.shippingAddress.addressLine2}</p>
                    )}
                    <p>
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                    </p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                    <p>Phone: {selectedOrder.shippingAddress.phone}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-2">Order Information</h4>
                  <div className="bg-muted p-3 rounded-md text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-muted-foreground">Status:</p>
                      <p>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(selectedOrder.status)}`}>
                          {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        </span>
                      </p>
                      
                      <p className="text-muted-foreground">Payment Method:</p>
                      <p>
                        {selectedOrder.paymentMethod === "credit_card" 
                          ? "Credit Card"
                          : selectedOrder.paymentMethod === "bank_transfer"
                          ? "Bank Transfer"
                          : "Cash on Delivery"}
                      </p>
                      
                      <p className="text-muted-foreground">Date:</p>
                      <p>{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                      
                      <p className="text-muted-foreground">Total:</p>
                      <p className="font-medium">${selectedOrder.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Order Items</h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Image</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Variant</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {item.product && (
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded-md"
                              />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.product?.name || `Product ID: ${item.productId}`}
                          </TableCell>
                          <TableCell>{item.variant || "Standard"}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            ${(item.price * item.quantity).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-muted rounded-md">
                <div className="text-muted-foreground">Total Amount:</div>
                <div className="font-poppins font-semibold text-lg">
                  ${selectedOrder.total.toFixed(2)}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOrderDetailsOpen(false)}
            >
              Close
            </Button>
            <Button onClick={() => {
              setIsOrderDetailsOpen(false);
              handleOpenStatusUpdate(selectedOrder!);
            }}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusUpdateOpen} onOpenChange={setIsStatusUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              {selectedOrder
                ? `Change the status for Order #${selectedOrder.id}`
                : "Select a new status for this order"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Status:</label>
              <div>
                {selectedOrder && (
                  <span 
                    className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(selectedOrder.status)}`}
                  >
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">New Status:</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                      Pending
                    </div>
                  </SelectItem>
                  <SelectItem value="processing">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                      Processing
                    </div>
                  </SelectItem>
                  <SelectItem value="shipped">
                    <div className="flex items-center">
                      <Truck className="h-4 w-4 text-purple-500 mr-2" />
                      Shipped
                    </div>
                  </SelectItem>
                  <SelectItem value="delivered">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Delivered
                    </div>
                  </SelectItem>
                  <SelectItem value="cancelled">
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 text-red-500 mr-2" />
                      Cancelled
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusUpdateOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateStatus} 
              disabled={!newStatus || updateOrderStatusMutation.isPending}
            >
              {updateOrderStatusMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
