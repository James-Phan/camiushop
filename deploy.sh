#!/bin/bash

# Dừng và xóa các container cũ (nếu có)
echo "Dừng và xóa các container cũ..."
docker-compose down

# Xây dựng và chạy các container mới
echo "Xây dựng và chạy các container mới..."
docker-compose up -d --build

# Hiển thị logs
echo "Truy cập trang web tại http://localhost:5000"
echo "Tài khoản admin: admin / admin123"
echo "Xem logs của container:"
docker-compose logs -f