#!/bin/bash

# Dừng và xóa các container cũ (nếu có)
echo "Dừng và xóa các container cũ..."
docker-compose down

# Xây dựng và chạy các container mới
echo "Xây dựng và chạy các container mới..."
docker-compose up -d --build

# Hiển thị thông tin kết nối
echo -e "\n=== THÔNG TIN KẾT NỐI ==="
echo "Truy cập trang web tại: http://localhost:5000"
echo "Tài khoản admin: admin / admin123"
echo -e "\n=== THÔNG TIN DATABASE ==="
echo "PostgreSQL database:"
echo "- Host: localhost"
echo "- Port: 5433"
echo "- Database: camiudb"
echo "- Username: postgres"
echo "- Password: postgres"
echo -e "\nKết nối trực tiếp với PostgreSQL bằng psql:"
echo "psql -h localhost -p 5433 -U postgres -d camiudb"
echo -e "\n=== XEM LOGS ==="
echo "Xem logs của container:"
docker-compose logs -f