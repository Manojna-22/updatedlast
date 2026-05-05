package com.hmi.alarm.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI documentation configuration.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI alarmBoardOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("HMI Alarm Acknowledgement Board API")
                        .description("Industry-grade REST API for managing HMI alarms with severity and acknowledgement state")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("HMI Team")
                                .email("hmi-support@company.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")));
    }
}
