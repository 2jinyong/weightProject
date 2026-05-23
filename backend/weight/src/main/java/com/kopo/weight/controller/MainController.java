package com.kopo.weight.controller;

import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.client.RestTemplate;

@Controller
public class MainController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping("/api/bmi")
    @ResponseBody
    public Map<String, Object> calculateBmi(@RequestBody Map<String, Object> data) {

        RestTemplate restTemplate = new RestTemplate();

        String fastApiUrl = "http://localhost:8000/api/ai-feedback";

        Map<String, Object> aiResponse =
                restTemplate.postForObject(fastApiUrl, data, Map.class);

        System.out.println("FastAPI 응답:");
        System.out.println(aiResponse);

        if (aiResponse == null || aiResponse.get("bmi") == null) {

            Map<String, Object> error = new HashMap<>();

            error.put("feedback", "AI 서버 응답 오류");
            error.put("status", "error");

            return error;
        }

        String name = data.get("name").toString();

        double height =
                Double.parseDouble(data.get("height").toString());

        double weight =
                Double.parseDouble(data.get("weight").toString());

        double bmi =
                Double.parseDouble(aiResponse.get("bmi").toString());

        String sql =
                "INSERT INTO health_info (name, height, weight, bmi) VALUES (?, ?, ?, ?)";

        jdbcTemplate.update(
                sql,
                name,
                height,
                weight,
                bmi
        );

        return aiResponse;
    }

    @PostMapping("/api/ai-feedback")
    @ResponseBody
    public Map<String, Object> getAiFeedback(
            @RequestBody Map<String, Object> data) {

        RestTemplate restTemplate = new RestTemplate();

        String fastApiUrl = "http://localhost:8000/api/ai-feedback";

        Map<String, Object> aiResponse =
                restTemplate.postForObject(fastApiUrl, data, Map.class);

        return aiResponse;
    }

    @GetMapping("/api/health-history")
    @ResponseBody
    public List<Map<String, Object>> getHealthHistory() {

        String sql =
                "SELECT id, name, height, weight, bmi, created_at " +
                "FROM health_info ORDER BY created_at DESC";

        List<Map<String, Object>> list =
                jdbcTemplate.queryForList(sql);

        SimpleDateFormat sdf =
                new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

        for (Map<String, Object> row : list) {

            if (row.get("created_at") != null) {

                String formattedDate =
                        sdf.format(row.get("created_at"));

                row.put("created_at", formattedDate);
            }
        }

        return list;
    }

    @PostMapping("/api/health-history/delete")
    @ResponseBody
    public Map<String, Object> deleteHealthHistory(
            @RequestBody Map<String, Object> data) {

        Map<String, Object> response = new HashMap<>();

        try {

            int id =
                    Integer.parseInt(data.get("id").toString());

            String sql =
                    "DELETE FROM health_info WHERE id = ?";

            int result =
                    jdbcTemplate.update(sql, id);

            if (result > 0) {

                response.put("status", "success");
                response.put("message", "삭제 성공");

            } else {

                response.put("status", "fail");
                response.put("message", "삭제 실패");
            }

        } catch (Exception e) {

            response.put("status", "error");
            response.put("message", e.getMessage());
        }

        return response;
    }
}