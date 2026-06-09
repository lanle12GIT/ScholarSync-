package com.nmcnpm.scholarslate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class ScholarslateApplication {

	public static void main(String[] args) {
		// Đặt múi giờ mặc định của JVM về giờ Việt Nam (UTC+7) NGAY TRƯỚC khi Spring khởi động,
		// để áp dụng trước mọi bean (HikariCP, scheduler...) và mọi LocalDate.now()/LocalDateTime.now().
		// Dùng cả system property lẫn setDefault cho chắc chắn.
		System.setProperty("user.timezone", "Asia/Ho_Chi_Minh");
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));

		SpringApplication.run(ScholarslateApplication.class, args);
	}

}
