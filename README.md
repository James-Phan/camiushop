# CAMIU Cosmetics E-commerce

Trang web thương mại điện tử cho CAMIU Cosmetics với danh mục sản phẩm, giỏ hàng, hệ thống thanh toán và bảng điều khiển quản trị.

## Tính năng

- Danh mục sản phẩm với hình ảnh, giá cả và đánh giá
- Giỏ hàng và thanh toán
- Đăng nhập và đăng ký người dùng
- Bảng điều khiển quản trị để quản lý sản phẩm và đơn hàng
- Tích hợp cơ sở dữ liệu PostgreSQL

## Công nghệ

- Frontend: React, TailwindCSS, shadcn/ui
- Backend: Node.js, Express
- Database: PostgreSQL với Drizzle ORM
- Authentication: Passport.js

## Cài đặt và Chạy với Docker

### Sử dụng Docker Compose (Đề xuất)

1. Đảm bảo bạn đã cài đặt Docker và Docker Compose
2. Clone repository này
3. Chạy lệnh sau để khởi động ứng dụng:

```bash
docker-compose up -d
```

4. Truy cập ứng dụng tại http://localhost:5000

### Chỉ sử dụng Docker

1. Đảm bảo bạn đã cài đặt Docker
2. Clone repository này
3. Build Docker image:

```bash
docker build -t camiu-cosmetics .
```

4. Chạy container:

```bash
docker run -p 5000:5000 -e DATABASE_URL=your_database_url -e SESSION_SECRET=your_session_secret camiu-cosmetics
```

5. Truy cập ứng dụng tại http://localhost:5000

## Biến môi trường

- `DATABASE_URL`: URL kết nối đến cơ sở dữ liệu PostgreSQL
- `SESSION_SECRET`: Chuỗi bí mật được sử dụng để mã hóa phiên (session)
- `NODE_ENV`: Môi trường chạy ứng dụng (development, production)

## Kết nối với PostgreSQL

PostgreSQL đã được cấu hình để cho phép kết nối từ bên ngoài container. Bạn có thể sử dụng các công cụ như pgAdmin, DBeaver hoặc bất kỳ công cụ quản lý PostgreSQL nào khác để kết nối trực tiếp với cơ sở dữ liệu:

- **Host**: localhost (hoặc IP máy chủ nếu triển khai từ xa)
- **Port**: 5433
- **Database**: camiudb
- **Username**: postgres
- **Password**: postgres

Ví dụ về chuỗi kết nối: `postgres://postgres:postgres@localhost:5433/camiudb`

## Tài khoản mặc định

- Admin: 
  - Username: admin
  - Password: admin123