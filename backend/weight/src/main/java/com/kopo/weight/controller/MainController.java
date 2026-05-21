package com.kopo.weight.controller;

import java.text.SimpleDateFormat;
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
	    String name = data.get("name").toString();
	    double height = Double.parseDouble(data.get("height").toString());
	    double weight = Double.parseDouble(data.get("weight").toString());
	    double bmi = Double.parseDouble(aiResponse.get("bmi").toString());
	   

	    // 3. DB에 저장 (JdbcTemplate 사용)
	    String sql = "INSERT INTO health_info (name, height, weight, bmi) VALUES (?, ?, ?, ?)";
	    jdbcTemplate.update(sql, name, height, weight, bmi);

	    // 4. 프론트로 결과 전달
	    return aiResponse;
	}
	
	@PostMapping("/api/ai-feedback")
	@ResponseBody
	public Map<String, Object> getAiFeedback(@RequestBody Map<String, Object> data) {
	    // 1. 프론트에서 보낸 height, weight가 담긴 data 주머니를 그대로 FastAPI로 토스합니다.
	    RestTemplate restTemplate = new RestTemplate();
	    String fastApiUrl = "http://localhost:8000/api/ai-feedback";
	    
	    // 2. FastAPI에게 물어보고 결과를 Map 형태로 받아옵니다.
	    Map<String, Object> aiResponse = restTemplate.postForObject(fastApiUrl, data, Map.class);

	    // 3. 기록을 새로 저장하는 기능이 아니기 때문에, DB 저장(INSERT) 없이 결과만 바로 프론트로 리턴합니다.
	    return aiResponse;
	}
	
	@GetMapping("/api/health-history")
	@ResponseBody
	public List<Map<String, Object>> getHealthHistory() {
	    // 모든 기록을 내림차순(최신순)으로 가져오기
	    String sql = "SELECT id, name, height, weight, bmi, created_at FROM health_info ORDER BY created_at DESC";
	    List<Map<String, Object>> list = jdbcTemplate.queryForList(sql);
	    
	    // 2. 날짜를 "년-월-일 시:분:초" 형태로 만들어 줄 포맷터 정의
	    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

	    // 3. 목록을 돌면서 원래 들어있던 날짜 객체를 문자열로 가공해서 덮어씌우기
	    for (Map<String, Object> row : list) {
	        if (row.get("created_at") != null) {
	            // DB에서 꺼낸 날짜(Timestamp 등)를 sdf를 이용해 "2026-05-20 10:40:00" 같은 문자로 변환
	            String formattedDate = sdf.format(row.get("created_at"));
	            
	            // Map 주머니에 기존 데이터를 지우고 이쁜 문자열로 바꾼 날짜를 다시 넣어줍니다.
	            row.put("created_at", formattedDate);
	        }
	    }
	    
	    return list;
	}
	
	@PostMapping("/api/health-history/delete")
	@ResponseBody
	public Map<String, Object> deleteHealthHistory(@RequestBody Map<String, Object> data) {
	    Map<String, Object> response = new HashMap<>();
	    
	    try {
	        // 1. 프론트에서 보낸 삭제할 항목의 id 꺼내기
	        int id = Integer.parseInt(data.get("id").toString());
	        
	        // 2. DB 삭제 쿼리 실행
	        String sql = "DELETE FROM health_info WHERE id = ?";
	        int result = jdbcTemplate.update(sql, id);
	        
	        // 3. 성공 여부 반환
	        if (result > 0) {
	            response.put("status", "success");
	            response.put("message", "기록이 성공적으로 삭제되었습니다.");
	        } else {
	            response.put("status", "fail");
	            response.put("message", "삭제할 데이터가 존재하지 않습니다.");
	        }
	    } catch (Exception e) {
	        response.put("status", "error");
	        response.put("message", "에러 발생: " + e.getMessage());
	    }
	    
	    return response;
	}
	

	
}
