package org.example;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/")
public class Controller {

    @GetMapping("/hello")
    public ResponseEntity<Map<String, Object>> getHello() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Hello from Spring Boot Backend!");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/data")
    public ResponseEntity<Map<String, Object>> getData() {
        List<Map<String, String>> items = new ArrayList<>();

        Map<String, String> item1 = new HashMap<>();
        item1.put("id", "1");
        item1.put("name", "Item One");
        item1.put("description", "First item from Spring Boot");
        items.add(item1);

        Map<String, String> item2 = new HashMap<>();
        item2.put("id", "2");
        item2.put("name", "Item Two");
        item2.put("description", "Second item from Spring Boot");
        items.add(item2);

        Map<String, Object> response = new HashMap<>();
        response.put("data", items);
        response.put("count", items.size());
        response.put("timestamp", LocalDateTime.now().toString());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/greet")
    public ResponseEntity<Map<String, String>> postGreet(@RequestBody Map<String, String> request) {
        String name = request.getOrDefault("name", "Guest");

        Map<String, String> response = new HashMap<>();
        response.put("greeting", "Hello, " + name + "!");
        response.put("receivedAt", LocalDateTime.now().toString());
        response.put("message", "Processed by Spring Boot");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Spring Boot Backend");
        return ResponseEntity.ok(response);
    }
}
