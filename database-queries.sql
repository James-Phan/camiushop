-- Lưu ý: Các câu lệnh SQL này được cung cấp để giúp bạn tìm hiểu cấu trúc cơ sở dữ liệu
-- và dành cho mục đích tham khảo/debug

-- Kết nối với PostgreSQL
-- psql -h localhost -p 5432 -U postgres -d camiudb

-- Liệt kê tất cả bảng trong schema public
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Xem thông tin về người dùng
SELECT * FROM users;

-- Xem thông tin về sản phẩm
SELECT * FROM products;

-- Xem thông tin về danh mục
SELECT * FROM categories;

-- Xem thông tin về giỏ hàng
SELECT * FROM cart_items;

-- Xem thông tin về đơn hàng
SELECT * FROM orders;

-- Xem thông tin về chi tiết đơn hàng
SELECT * FROM order_items;

-- Xem thông tin về đánh giá sản phẩm
SELECT * FROM reviews;

-- Truy vấn sản phẩm và danh mục của chúng
SELECT p.id, p.name, p.price, c.name as category_name
FROM products p
JOIN categories c ON p.category_id = c.id
ORDER BY p.id;

-- Truy vấn đơn hàng và chi tiết của chúng
SELECT o.id, o.user_id, o.total, o.status, oi.product_id, oi.quantity, oi.price
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
ORDER BY o.id;

-- Truy vấn giỏ hàng của người dùng
SELECT u.username, p.name as product_name, ci.quantity, p.price
FROM cart_items ci
JOIN users u ON ci.user_id = u.id
JOIN products p ON ci.product_id = p.id;

-- Truy vấn đánh giá sản phẩm và người dùng
SELECT p.name as product_name, u.username, r.rating, r.title, r.comment
FROM reviews r
JOIN users u ON r.user_id = u.id
JOIN products p ON r.product_id = p.id;

-- Đếm số lượng sản phẩm theo danh mục
SELECT c.name, COUNT(p.id) as product_count
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.name
ORDER BY product_count DESC;

-- Tính tổng doanh thu theo trạng thái đơn hàng
SELECT status, SUM(total) as total_revenue
FROM orders
GROUP BY status
ORDER BY total_revenue DESC;