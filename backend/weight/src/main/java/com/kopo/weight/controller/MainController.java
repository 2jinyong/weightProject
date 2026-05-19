package com.kopo.weight.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@Controller
public class MainController {
	@Autowired
	private JdbcTemplate jdbcTemplate;

	@PostMapping("/api/bmi")
	@ResponseBody
	public Map<String, Object> calculateBmi(@RequestBody Map<String, Object> data) {
	    // 1. FastAPI 호출하여 BMI 수치와 피드백 받아오기
	    RestTemplate restTemplate = new RestTemplate();
	    String fastApiUrl = "http://localhost:8000/api/ai-feedback";
	    Map<String, Object> aiResponse = restTemplate.postForObject(fastApiUrl, data, Map.class);

	    // 2. 받은 결과값 추출
	    double height = Double.parseDouble(data.get("height").toString());
	    double weight = Double.parseDouble(data.get("weight").toString());
	    double bmi = Double.parseDouble(aiResponse.get("bmi").toString());

	    // 3. DB에 저장 (JdbcTemplate 사용)
	    String sql = "INSERT INTO health_info (height, weight, bmi) VALUES (?, ?, ?)";
	    jdbcTemplate.update(sql, height, weight, bmi);

	    // 4. 프론트로 결과 전달
	    return aiResponse;
	}
	
	@GetMapping("/api/health-history")
	@ResponseBody
	public List<Map<String, Object>> getHealthHistory() {
	    // 모든 기록을 내림차순(최신순)으로 가져오기
	    String sql = "SELECT id, height, weight, bmi, created_at FROM health_info ORDER BY created_at DESC";
	    return jdbcTemplate.queryForList(sql);
	}
	
}
