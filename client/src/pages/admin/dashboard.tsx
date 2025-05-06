import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  BarChart4,
  PieChart as PieChartIcon,
  Eye,
} from "lucide-react";
import { Order, ProductWithDetails, Category } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { toast } = useToast();
  
  // States for order details modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  
  // Fetch data for dashboard
  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const { data: products } = useQuery<ProductWithDetails[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
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
  
  // Function to handle viewing order details
  const handleViewOrder = (orderId: number) => {
    const order = orders?.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setIsOrderDetailsOpen(true);
    }
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

  // Calculate dashboard metrics
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
  const totalProducts = products?.length || 0;
  const totalCategories = categories?.length || 0;

  // Orders by status for pie chart
  const ordersByStatus = orders
    ? Object.entries(
        orders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
      }))
    : [];

  // Products by category for bar chart
  const productsByCategory = categories
    ? categories.map((category) => ({
        name: category.name,
        products: products?.filter((p) => p.categoryId === category.id).length || 0,
      }))
    : [];

  // Dummy data for order trend (in a real app, this would come from the API)
  const orderTrend = [
    { name: "Jan", orders: 5 },
    { name: "Feb", orders: 8 },
    { name: "Mar", orders: 12 },
    { name: "Apr", orders: 10 },
    { name: "May", orders: 15 },
    { name: "Jun", orders: 20 },
  ];

  // Colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-poppins font-bold text-2xl">Admin Dashboard</h1>
          <div className="space-x-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/products">Manage Products</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/orders">Manage Orders</Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <h3 className="font-poppins font-bold text-2xl">{totalOrders}</h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="bg-green-500/10 p-3 rounded-full mr-4">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <h3 className="font-poppins font-bold text-2xl">${totalRevenue.toFixed(2)}</h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="bg-blue-500/10 p-3 rounded-full mr-4">
                <Package className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <h3 className="font-poppins font-bold text-2xl">{totalProducts}</h3>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="bg-purple-500/10 p-3 rounded-full mr-4">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <h3 className="font-poppins font-bold text-2xl">{totalCategories}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="mb-8">
          <Tabs defaultValue="bar">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-poppins font-semibold text-lg">Analytics</h2>
              <TabsList>
                <TabsTrigger value="bar" className="flex items-center">
                  <BarChart4 className="h-4 w-4 mr-2" />
                  Bar Chart
                </TabsTrigger>
                <TabsTrigger value="pie" className="flex items-center">
                  <PieChartIcon className="h-4 w-4 mr-2" />
                  Pie Chart
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="bar">
              <Card>
                <CardHeader>
                  <CardTitle>Orders Trend</CardTitle>
                  <CardDescription>Monthly order volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={orderTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="orders" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pie">
              <Card>
                <CardHeader>
                  <CardTitle>Orders by Status</CardTitle>
                  <CardDescription>Distribution of order statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ordersByStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {ordersByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Recent Orders & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer purchases</CardDescription>
            </CardHeader>
            <CardContent>
              {orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-4 rounded-lg border">
                      <div>
                        <div className="font-medium">Order #{order.id}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${order.total.toFixed(2)}</div>
                        <div className="text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewOrder(order.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No orders found</p>
              )}
              {orders && orders.length > 5 && (
                <div className="mt-4 text-center">
                  <Button asChild variant="outline">
                    <Link href="/admin/orders">View All Orders</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Products by Category</CardTitle>
              <CardDescription>Distribution of products across categories</CardDescription>
            </CardHeader>
            <CardContent>
              {productsByCategory.length > 0 ? (
                <div className="space-y-4">
                  {productsByCategory.map((category, index) => (
                    <div key={index} className="flex justify-between items-center p-4 rounded-lg border">
                      <div className="font-medium">{category.name}</div>
                      <div className="flex items-center">
                        <div className="font-medium mr-2">{category.products} products</div>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/products?category=${index + 1}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No categories found</p>
              )}
              <div className="mt-4 text-center">
                <Button asChild variant="outline">
                  <Link href="/admin/products">Manage Products</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Details Dialog */}
        <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                {selectedOrder ? `Order #${selectedOrder.id} Details` : "Loading order details..."}
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Order Information</h3>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="mb-1"><span className="font-medium">Order ID:</span> #{selectedOrder.id}</p>
                      <p className="mb-1"><span className="font-medium">Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                      <p className="mb-1">
                        <span className="font-medium">Status:</span>{" "}
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(selectedOrder.status)}`}>
                          {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        </span>
                      </p>
                      <p className="mb-1"><span className="font-medium">Payment Method:</span> {selectedOrder.paymentMethod}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Shipping Address</h3>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="mb-1">{selectedOrder.shippingAddress.fullName}</p>
                      <p className="mb-1">{selectedOrder.shippingAddress.addressLine1}</p>
                      {selectedOrder.shippingAddress.addressLine2 && <p className="mb-1">{selectedOrder.shippingAddress.addressLine2}</p>}
                      <p className="mb-1">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}</p>
                      <p className="mb-1">{selectedOrder.shippingAddress.country}</p>
                      <p>{selectedOrder.shippingAddress.phone}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Order Items</h3>
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
                if (selectedOrder) {
                  handleOpenStatusUpdate(selectedOrder);
                }
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
                        <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                        Shipped
                      </div>
                    </SelectItem>
                    <SelectItem value="delivered">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        Delivered
                      </div>
                    </SelectItem>
                    <SelectItem value="cancelled">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
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
                disabled={updateOrderStatusMutation.isPending}
              >
                {updateOrderStatusMutation.isPending ? "Updating..." : "Update Status"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
