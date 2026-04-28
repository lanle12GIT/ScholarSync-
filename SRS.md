# MÔ TẢ ĐẶC TẢ YÊU CẦU: Hệ Thống Theo Dõi và Tóm Tắt Paper (SRS)

## 1. Giới Thiệu (Overview)
Ứng dụng web được phát triển với mục tiêu hỗ trợ cộng đồng các nhà nghiên cứu, sinh viên và những người đam mê khoa học dễ dàng cập nhật được các bài báo khoa học (paper) mới nhất. Hệ thống không chỉ lưu giữ thông tin học thuật mà còn ứng dụng công nghệ để tự động thu thập từ các nguồn uy tín (ví dụ: arXiv) và tóm tắt ngắn gọn báo cáo giúp tiết kiệm thời gian đọc.

**Mục tiêu chính**:
- Nắm bắt nhanh sự xuất hiện của các paper mới.
- Đọc nhanh ý chính cốt lõi của các paper dài.
- Lưu trữ và tổ chức bài báo phù hợp với chuyên ngành/sở thích của bản thân.

## 2. Đối Tượng Người Dùng (Actors)
- **Người dùng (Reader/Researcher)**: Tìm kiếm, theo dõi các chủ đề và đọc tóm tắt paper.
- **Hệ thống (System/Background Job)**: Thực thi lệnh fetch dữ liệu paper mới theo định kỳ, tự động sinh tóm tắt thông qua mô hình AI (hoặc thuật toán) được cấu hình.

## 3. Đặc Tả Chức Năng (Functional Requirements)

### 3.1. Chức Năng Cơ Bản (Core - Mức Tối Thiểu 8 Điểm)
Đây là các chức năng nền tảng đảm bảo hệ thống có thể đi vào vận hành.

1. **Quản Lý Tài Khoản (Authentication)**:
   - Giao diện đăng ký (Register) và đăng nhập (Login) an toàn cho người dùng cá nhân.
2. **Quản Lý Chủ Đề Trọng Tâm (Topic Tracking)**:
   - Thêm, Sửa, Xóa các chủ đề học thuật muốn theo dõi (Ví dụ: "AI", "Machine Learning", "Stock Prediction", "AI Agents").
3. **Thu Thập Dữ Liệu Tự Động (Auto-Fetching)**:
   - Hệ thống tự động crawling/lấy dữ liệu paper thông qua RSS feed hoặc API từ các chuyên trang học thuật lưu trữ (Điển hình là `arXiv`).
4. **Lưu Trữ Thông Tin Paper Cốt Lõi**:
   - Trường dữ liệu tối thiểu bao gồm: *Tiêu đề, tóm tắt gốc (abstract), danh sách tác giả, lịch công bố bản pre-print/bản chính thức, và đường dẫn (URL).*
5. **Tự Động Sinh Tóm Tắt (Summarization)**:
   - Xử lý ngôn ngữ tự nhiên đối với trích đoạn abstract để diễn giải ra một đoạn văn ngắn gọn, súc tích chứa đựng "Ý chính" (Key takeaways).
6. **Timeline Danh Sách Bài Báo (New Papers Feed)**:
   - Trình bày danh sách trực quan các bài báo mới được công bố, phân bổ theo từng chủ đề hoặc kết hợp.
7. **Tìm Kiếm và Bộ Lọc (Search & Filtering)**:
   - Cho phép người dùng nhập từ khóa chuyên ngành, hoặc ấn chọn các tag Chủ đề để lọc kết quả hiển thị của bài báo.
8. **Xem Chi Tiết và Bookmark Bài Báo**:
   - Xem toàn bộ dữ liệu metadata của tập tài liệu cộng với thẻ tóm tắt.
   - Thao tác "Lưu" (Favorite/Bookmark) paper vào danh sách yêu thích cá nhân.

### 3.2. Chức Năng Nâng Cao (Advanced - 2 Điểm Cộng)
Bổ sung các tiện ích thông minh nâng cấp khả năng học thuật và tối ưu logic nghiệp vụ cho người dùng.

1. **Gợi Ý Đề Xuất (Recommendation System)**:
   - Từ các chủ đề đang theo dõi và danh sách paper yêu thích, thuật toán tìm và đẩy các paper tương quan lên luồng dữ liệu cho người dùng.
2. **Loại Bỏ Dữ Liệu Trùng Lặp (Deduplication Analyzer)**:
   - Áp dụng kiểm tra Similarity để lọc hoặc phân loại khi một bài báo được đăng nhiều lần hoặc lấy từ các phiên bản cập nhật giống tỷ lệ cao.
3. **Hệ Thống Thông Báo Thời Gian Thực (Push Notification / Email)**:
   - Bắn thông báo cảnh báo tức thì ngay khi hệ thống tìm ra một bài báo mới bám sát các từ khóa cực kỳ quan trọng đối với người sử dụng.
4. **Thống Kê Trực Quan (Treb Analytics)**:
   - Hiển thị bản đồ nhiệt, biểu đồ lượng tăng trưởng public paper phân mảng theo từng ngày để nhận diện được Xu hướng công nghệ (Trend).
5. **Đánh Giá Tầm Quy Mô (Paper Scoring)**:
   - Cơ chế tự chấm điểm (hoặc kết hợp vote) để lọc ra các "Paper đáng đọc" thay vì các trang tạp chí rác. Trọng số có thể dùng lượng Citation (nếu lấy được).

## 4. Các Giới Hạn và Yêu Cầu Phi Chức Năng (Non-Functional Requirements)
- **Thiết kế UI/UX**: Phải hiện đại, tập trung trải nghiệm đọc nhanh, giao diện rõ ràng.
- **Tốc độ / Hiệu suất**: Do việc đồng bộ hóa arXiv có thể mất thời gian, hệ thống tiến trình ngầm (Scheduler) phải luôn luôn phân tách tách biệt với Endpoint API phục vụ trải nghiệm người dùng cuối.
- **Khả năng mở rộng**: Trong tương lai có thể cắm thêm cổng dữ liệu từ *PubMed*, *IEEE Xplore* ngoài *arXiv*.
