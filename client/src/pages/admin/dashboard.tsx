import { Link } from "wouter";
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
import { Order, Product, Category } from "@/lib/types";

export default function AdminDashboard() {
  // Fetch data for dashboard
  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

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
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
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
      </div>
    </main>
  );
}
