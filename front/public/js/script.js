// 1. 건강 기록 삭제 함수
function deleteHistory(id) {
    if (!confirm("정말 이 기록을 삭제하시겠습니까?")) {
        return; 
    }

    $.ajax({
        url: 'http://20.196.153.122:8181/api/health-history/delete',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ id: id }),
        success: function(res) {
            if (res.status === "success") {
                alert(res.message);
                location.reload();
            } else {
                alert(res.message);
            }
        },
        error: function() {
            alert("삭제 중 서버 오류가 발생했습니다.");
        }
    });
}

// 2. AI 분석 요청 함수 (리스트에서 버튼 클릭 시 작동)
function askAI(h, w) {
    let response = $('#response');
    response.fadeIn().html("AI 분석 중...");

    const currentPath = window.location.pathname;
    let requestType = 'bmi'; 

    if (currentPath.includes('food')) {
        requestType = 'food';    
    } else if (currentPath.includes('fitness')) {
        requestType = 'fitness'; 
    } else if (currentPath.includes('bmi')) {
        requestType = 'bmi';     
    }

    $.ajax({
        url: 'http://20.196.153.122:8181/api/ai-feedback',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            height: h,
            weight: w,
            type: requestType
        }),
        success: function(res) {
            if (!res.feedback) {
                response.html("<p style='color:red;'>AI 응답 생성 실패</p>");
                console.log(res);
                return;
            }
            response.html("<p>" + res.feedback.replace(/\n/g, "<br>") + "</p>");
        },
        error: function() {
            response.html("<p style='color:red;'>분석 중 오류가 발생했습니다.</p>");
        }
    });
}

// 3. 페이지 로드 시 이벤트 연결 및 목록 가져오기
$(document).ready(function() {
    
    // 메인 BMI 페이지에서 입력하기 버튼 클릭 시 작동 로직
    $('#bmiBtn').click(function() {
        let nameVal = $('#name').val() ? $('#name').val() : "이름없음";
        let heightVal = parseFloat($('#height').val());
        let weightVal = parseFloat($('#weight').val());

        if (!heightVal || !weightVal || heightVal <= 0 || weightVal <= 0) {
            alert("올바른 키와 몸무게를 입력해 주세요.");
            return;
        }

        // ★ [해결] 파이썬 유효성 검사 통과를 위해 type: "bmi"를 무조건 포함시킵니다.
        $.ajax({
            url: 'http://20.196.153.122:8181/api/bmi', 
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                name: nameVal,
                height: heightVal,
                weight: weightVal,
                type: 'bmi' // ★ 파이썬 백엔드가 요구하는 누락된 필수 필드 채움!
            }),
            success: function(saveRes) {
                console.log("디비 저장 및 AI 분석 완료");
                if (saveRes && saveRes.feedback) {
                    $('#response').fadeIn().html("<p>" + saveRes.feedback.replace(/\n/g, "<br>") + "</p>");
                } else {
                    askAI(heightVal, weightVal); 
                }
                loadHistoryList(); // 하단 리스트 최신화
            },
            error: function(xhr) {
                console.error("스프링 저장 에러:", xhr.responseText);
                askAI(heightVal, weightVal); 
            }
        });
    });

    // 4. DB에서 건강 기록 목록 가져오기 로직
    function loadHistoryList() {
        $.get('http://20.196.153.122:8181/api/health-history', function(list) {

            const currentPath = window.location.pathname;
            let btnText = "이 정보로 분석 받기"; 
            
            if (currentPath.includes('food')) {
                btnText = "이 정보로 식단 받기";
            } else if (currentPath.includes('fitness')) {
                btnText = "이 정보로 운동 루틴 받기";
            } else if (currentPath.includes('bmi')) {
                btnText = "이 정보로 BMI 분석 받기";
            }

            let html = '';

            if (list.length === 0) {
                html = `
                    <div class="no-data-box">
                        <div class="icon">📋</div>
                        <h3>아직 저장된 건강 기록이 없습니다.</h3>
                        <p>메인 페이지에서 키와 몸무게를 입력하고 AI 분석을 시작해 보세요!</p>
                        <button type="button" id="listBtn"><a href="/bmi" class="go-main-btn">첫 기록 등록하러 가기</a></button>
                    </div>`;
            } else {
                html = '<h3>분석할 신체 정보를 선택하세요</h3>';
                list.forEach(item => {
                    let displayName = item.name ? item.name : "이름없음";

                    html += `
                        <div class="history-item" style="border: 1px solid #eee; padding: 15px; margin-bottom: 12px; border-radius: 8px;">
                            <span><strong>이름:</strong> ${displayName} | <strong>신장:</strong> ${item.height}cm | <strong>체중:</strong> ${item.weight}kg | <strong>BMI:</strong> ${item.bmi}
                                | <strong>날짜:</strong> ${item.created_at ? item.created_at : ''}</span>

                            <div style="margin-top: 10px;">
                                <button onclick="askAI(${item.height}, ${item.weight})">${btnText}</button>
                                <button onclick="deleteHistory(${item.id})" class="del-btn">삭제하기</button>
                            </div>
                        </div>`;
                });
            }

            $('#historyList').html(html);
        });
    }

    loadHistoryList();
});
