package com.mailapp.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

/**
 * Production-ready DataSource configuration.
 *
 * Normalizes DATABASE_URL from cloud hosting platforms (Railway, Render, Supabase, Heroku):
 * 1. Converts postgres:// or postgresql:// URIs to jdbc:postgresql://
 * 2. Extracts username/password if embedded in URI (e.g. postgres://user:pass@host:port/db)
 * 3. Enforces sslmode=require for remote database hosts (like Supabase, AWS, Railway)
 * 4. Configures resilient HikariCP timeouts to prevent container crash-loops.
 */
@Slf4j
@Configuration
public class DatabaseConfig {

    @Value("${spring.datasource.url:}")
    private String configuredUrl;

    @Value("${spring.datasource.username:}")
    private String configuredUsername;

    @Value("${spring.datasource.password:}")
    private String configuredPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        String rawEnvUrl = System.getenv("DATABASE_URL");
        String urlToUse = (rawEnvUrl != null && !rawEnvUrl.isBlank()) ? rawEnvUrl.trim() : configuredUrl;
        String userToUse = configuredUsername;
        String passToUse = configuredPassword;

        String rawEnvUser = System.getenv("DATABASE_USERNAME");
        if (rawEnvUser != null && !rawEnvUser.isBlank()) {
            userToUse = rawEnvUser.trim();
        }

        String rawEnvPass = System.getenv("DATABASE_PASSWORD");
        if (rawEnvPass != null && !rawEnvPass.isBlank()) {
            passToUse = rawEnvPass.trim();
        }

        if (urlToUse == null || urlToUse.isBlank()) {
            urlToUse = "jdbc:postgresql://localhost:5432/postgres";
        }

        // Handle standard non-JDBC PostgreSQL URI formats e.g. postgresql://user:pass@host:5432/dbname
        if (urlToUse.startsWith("postgres://") || urlToUse.startsWith("postgresql://")) {
            try {
                URI uri = new URI(urlToUse.replace("postgres://", "postgresql://"));
                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String path = uri.getPath();
                String dbName = (path != null && path.length() > 1) ? path.substring(1) : "postgres";

                String userInfo = uri.getUserInfo();
                if (userInfo != null && !userInfo.isBlank()) {
                    String[] parts = userInfo.split(":", 2);
                    if (userToUse == null || userToUse.isBlank() || "postgres".equals(userToUse)) {
                        userToUse = parts[0];
                    }
                    if (parts.length > 1 && (passToUse == null || passToUse.isBlank())) {
                        passToUse = parts[1];
                    }
                }

                String query = uri.getQuery();
                StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://")
                        .append(host)
                        .append(":")
                        .append(port)
                        .append("/")
                        .append(dbName);

                if (query != null && !query.isBlank()) {
                    jdbcUrl.append("?").append(query);
                    if (!query.contains("sslmode") && !host.equals("localhost") && !host.equals("127.0.0.1")) {
                        jdbcUrl.append("&sslmode=require");
                    }
                } else if (!host.equals("localhost") && !host.equals("127.0.0.1")) {
                    jdbcUrl.append("?sslmode=require");
                }

                urlToUse = jdbcUrl.toString();
                log.info("Normalized platform DATABASE_URL to JDBC format for host: {}", host);
            } catch (Exception e) {
                log.warn("Unable to parse DATABASE_URL as URI, using fallback normalization: {}", e.getMessage());
                if (urlToUse.startsWith("postgres://")) {
                    urlToUse = "jdbc:postgresql://" + urlToUse.substring("postgres://".length());
                } else if (urlToUse.startsWith("postgresql://")) {
                    urlToUse = "jdbc:postgresql://" + urlToUse.substring("postgresql://".length());
                }
            }
        }

        // Ensure remote hosts have SSL enabled if missing
        if (!urlToUse.contains("sslmode") && !urlToUse.contains("localhost") && !urlToUse.contains("127.0.0.1")) {
            urlToUse += (urlToUse.contains("?") ? "&" : "?") + "sslmode=require";
        }

        log.info("Initializing HikariCP with JDBC URL: {}", maskJdbcUrl(urlToUse));

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(urlToUse);
        config.setDriverClassName("org.postgresql.Driver");

        if (userToUse != null && !userToUse.isBlank()) {
            config.setUsername(userToUse);
        }
        if (passToUse != null && !passToUse.isBlank()) {
            config.setPassword(passToUse);
        }

        // Pool tuning for cloud deployment stability
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.setConnectionTimeout(15000); // 15s timeout
        config.setIdleTimeout(30000);
        config.setMaxLifetime(1800000); // 30m
        config.setInitializationFailTimeout(15000); // Do not hang indefinitely if DB is warming up

        return new HikariDataSource(config);
    }

    private String maskJdbcUrl(String url) {
        if (url == null) return "";
        return url.replaceAll("://[^:@]+:[^@]+@", "://***:***@");
    }
}
