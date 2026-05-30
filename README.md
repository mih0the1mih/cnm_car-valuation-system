Cách 1: Merge trên GitHub (khuyên dùng)
Bước 1: Push branch lên GitHub

Ví dụ người A:

git checkout -b feature-login
git add .
git commit -m "Hoan thanh login"
git push origin feature-login
Bước 2: Tạo Pull Request (PR)

Trên GitHub sẽ hiện nút:

Compare & pull request

Nhấn vào.

Bước 3: Chọn
base: main
compare: feature-login

Nhấn:

Create Pull Request
Bước 4: Merge

Nếu không có conflict:

Merge Pull Request
↓
Confirm Merge

Code từ feature-login sẽ được gộp vào main.

Cách 2: Merge bằng Git
Đang ở branch main
git checkout main

Lấy code mới nhất:

git pull origin main

Merge branch cần gộp:

git merge feature-login

Push lên GitHub:

git push origin main
Nếu bị Conflict

Ví dụ Git báo:

CONFLICT (content): Merge conflict in index.php
Automatic merge failed

Mở file bị lỗi sẽ thấy:

<<<<<<< HEAD
echo "Code cua main";
=======
echo "Code cua feature-login";
>>>>>>> feature-login
Sửa thành:
echo "Code da duoc gop";

Xóa toàn bộ:

<<<<<<<
=======
>>>>>>>

Sau đó:

git add .
git commit -m "Resolve conflict"
git push origin main
Quy trình nhóm nên dùng

Mỗi người:

git checkout -b ten_chuc_nang

Ví dụ:

git checkout -b feature-login
git checkout -b feature-payment
git checkout -b feature-admin

Làm xong:

git push origin feature-login

Tạo Pull Request → Trưởng nhóm Merge.

Không nên để tất cả cùng push trực tiếp lên main, vì rất dễ conflict và mất code.

Kiểm tra branch hiện có
git branch
Xem tất cả branch trên remote
git branch -a
Chuyển branch
git checkout feature-login

hoặc Git mới:

git switch feature-login
