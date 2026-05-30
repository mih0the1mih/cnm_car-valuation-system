Quy Trình Làm Việc Nhóm Trên GitHub
**1. Clone dự án
**
Mỗi thành viên clone source code từ GitHub về máy:

git clone https://github.com/ten-user/ten-project.git
cd ten-project

**2. Không code trực tiếp trên branch main
**
Trước khi bắt đầu một chức năng mới, tạo branch riêng:

git checkout -b ten-chuc-nang

Ví dụ:

git checkout -b feature-login
git checkout -b feature-car-management
git checkout -b feature-pricing

Quy ước đặt tên branch:

feature-ten-chuc-nang : Chức năng mới
fix-ten-loi : Sửa lỗi
test-ten-chuc-nang : Kiểm thử

**3. Đồng bộ code mới nhất trước khi làm việc
**
Trước khi code, luôn cập nhật branch main:

git checkout main
git pull origin main

Sau đó quay lại branch của mình:

git checkout ten-chuc-nang

**4. Commit code
**
Sau khi hoàn thành một phần chức năng:

git add .
git commit -m "Mô tả nội dung đã thực hiện"

Ví dụ:

git commit -m "Hoan thanh giao dien dang nhap"

**5. Push code lên GitHub
**git push origin ten-chuc-nang

Ví dụ:

git push origin feature-login

**6. Tạo Pull Request (PR)
**
Sau khi push:

Vào GitHub Repository.
Chọn Compare & Pull Request.
Chọn:
Base Branch: main
Compare Branch: ten-chuc-nang
Nhấn Create Pull Request.

**7. Merge code
**
Chỉ Leader hoặc người được phân quyền thực hiện Merge:

Pull Request
↓
Review Code
↓
Merge Pull Request
↓
Confirm Merge

Không tự ý merge nếu chưa được review.

**8. Xử lý Conflict
**
Nếu xảy ra xung đột:

git pull origin main

Sửa các file bị conflict, sau đó:

git add .
git commit -m "Resolve conflict"
git push
