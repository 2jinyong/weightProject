function deleteHistory(id) {
    if (!confirm("정말 이 기록을 삭제하시겠습니까?")) {
        return; // 취소를 누르면 아무것도 안 함
    }

    $.ajax({
        url: 'http://localhost:8181/api/health-history/delete',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ id: id }),
        success: function(res) {
            if (res.status === "success") {
                alert(res.message);
                // ★ 중요: 삭제 성공 후 화면 목록을 새로고침하기 위해 페이지를 리로드하거나 
                // 목록 불러오는 함수를 다시 호출합니다. 여기선 편하게 새로고침 처리합니다.
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

function askAI(h, w) {    
    let response = $('#response');
    response.fadeIn().html("AI 분석 중...");

    // 현재 접속한 페이지의 주소(URL)를 감지합니다. (예: /food, /fitness 등)
    const currentPath = window.location.pathname;
    let requestType = 'all'; // 기본값 (메인 페이지 종합 분석)

    if (currentPath.includes('food')) {
        requestType = 'food';    // 식단 페이지일 때
    } else if (currentPath.includes('fitness')) {
        requestType = 'fitness'; // 운동 페이지일 때
    }

    $.ajax({
        url: 'http://localhost:8181/api/ai-feedback', 
        type: 'POST',
        contentType: 'application/json',
        // 감지된 requestType('all', 'food', 'fitness')을 주머니에 함께 넣어 보냅니다.
        data: JSON.stringify({ height: h, weight: w, type: requestType }),
        success: function(res) {
            response.html(`<h4>AI 분석 결과</h4><p>${res.feedback.replace(/\n/g, '<br>')}</p>`);
        },
        error: function(xhr) {
            response.html("<p style='color:red;'>분석을 불러오지 못했습니다.</p>");
        }
    });

}

$(function(){
    const slide = $('#slideIn');
    const width = $('#slidebox').outerWidth();
    let slideIndex = 0;
    let slideCount = $('#slideIn img').length;
    let slideText = $('#slideText');

    function slideShow(){
        switch (slideIndex) {
            case 0:
                slideText.text("평균 체중표");
                break;
            case 1:
                slideText.text("건강을 위한 식단관리");
                break;
            case 2:
                slideText.text("건강한 위한 운동관리");
                break;    
        }

        slide.stop().animate({
            'margin-left': -(width * slideIndex)+'px'
        },500);
        slideIndex = (slideIndex + 1) % slideCount;
    }

    if(slideCount > 0) setInterval(slideShow,3000);


    let response = $('#response')
    const goBox = $('#goBox')

    $('#bmiBtn').click(function() {
        // 1. 입력값 가져오기
        const data = {
            name: $('#name').val(),
            height: $('#height').val(),
            weight: $('#weight').val(),
            type: 'all' // 메인에서 직접 입력할 때는 종합 분석으로 요청
        };

        // 2. 데이터가 잘 담겼는지 로그 찍어보기
        console.log("전송 데이터:", data);
        
        response.fadeIn();
        response.html("로딩중...");
        

        // 3. AJAX 전송
        $.ajax({
            type: 'POST',
            url: 'http://localhost:8181/api/bmi',
            contentType: 'application/json', // 스프링이 JSON으로 인식하게 함
            data: JSON.stringify(data),      // 반드시 문자열로 변환
            success: function(res) {
                console.log('스프링 대답:', res);
                alert("서버 응답 성공!");
                
                response.html(res.feedback.replace(/\n/g, '<br>'));
                $('#goBox').css('display', 'flex');
            },
            error: function(xhr) {
                console.error("에러 발생! 상태 코드:", xhr.status);
            }
        }); 
    });

// 1. 페이지 로드 시 목록 가져오기 (데이터가 없을 때 처리 추가)
    if ($('#historyList').length > 0) {
        $.get('http://localhost:8181/api/health-history', function(list) {
            
            const currentPath = window.location.pathname;
            let btnText = "이 정보로 분석 받기";
            if (currentPath.includes('food')) btnText = "이 정보로 식단 받기";
            if (currentPath.includes('fitness')) btnText = "이 정보로 운동 루틴 받기";

            let html = '';

            // ★ 핵심 조건문: DB에서 가져온 리스트가 비어있을 때
            if (list.length === 0) {
                html = `
                    <div class="no-data-box">
                        <div class="icon">📋</div>
                        <h3>아직 저장된 건강 기록이 없습니다.</h3>
                        <p>메인 페이지에서 키와 몸무게를 입력하고 AI 분석을 시작해 보세요!</p>
                        <button type="button" id="listBtn"><a href="/bmi" class="go-main-btn">첫 기록 등록하러 가기</a></button>
                    </div>`;
            } else {
                // 데이터가 있을 때는 기존처럼 목록을 만들어 줍니다.
                html = '<h3>분석할 신체 정보를 선택하세요</h3>';
                list.forEach(item => {
                    let displayName = item.name ? item.name : "이름없음";
                    
                    html += `
                        <div class="history-item">
                            <span><strong>이름:</strong> ${displayName} | <strong>신장:</strong> ${item.height}cm | <strong>체중:</strong> ${item.weight}kg | <strong>BMI:</strong> ${item.bmi}| <strong>날짜:</strong> ${item.created_at}</span>
                            <div>
                                <button onclick="askAI(${item.height}, ${item.weight})">${btnText}</button>
                                <button onclick="deleteHistory(${item.id})" class="del-btn">삭제하기</button>
                            </div>
                        </div>`;
                });
            }
            
            // 완성된 HTML을 화면에 밀어 넣기
            $('#historyList').html(html);
        });
    }

});