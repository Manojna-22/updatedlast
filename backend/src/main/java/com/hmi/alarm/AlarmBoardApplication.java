package com.hmi.alarm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * HMI Alarm Acknowledgement Board - Spring Boot Application Entry Point
 */
@SpringBootApplication
@EnableScheduling
public class AlarmBoardApplication {

    public static void main(String[] args) {
        SpringApplication.run(AlarmBoardApplication.class, args);
    }
}
