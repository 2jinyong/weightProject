$(function(){

    const slide = $('#slideIn');
    const width = $('#slidebox').outerWidth();
    let slideIndex = 0;
    let slideCount =$('#slideIn img').length;
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

    setInterval(slideShow,3000);

    
    let response = $('#response')
    const goBox = $('#goBox')

    $('#bmiBtn').click(function() {
        // 1. 입력값 가져오기
        const data = {
            height: $('#height').val(),
            weight: $('#weight').val()
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
                
                response.html(res.feedback);
                $('#goBox').css('display', 'flex');
            },
            error: function(xhr) {
                console.error("에러 발생! 상태 코드:", xhr.status);
            }
        }); 
    });

    // 1. 페이지 로드 시 목록 가져오기
    $.get('http://localhost:8181/api/health-history', function(list) {
        let html = '<h3>분석할 신체 정보를 선택하세요</h3>';
        list.forEach(item => {
            html += `
                <div class="history-item" style="border:1px solid #ccc; margin:5px; padding:10px;">
                    날짜: ${item.created_at} | BMI: ${item.bmi} 
                    <button onclick="askAI(${item.height}, ${item.weight})">이 정보로 식단 받기</button>
                </div>`;
        });
        $('#historyList').html(html);
    });

    function askAI(h, w) {
    $('#aiAdviceArea').show().text("Gemma가 분석 중입니다... 잠시만 기다려주세요.");
    
    $.ajax({
        url: 'http://localhost:8181/api/ai-feedback', // 아까 만든 FastAPI 연동 컨트롤러
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ height: h, weight: w }),
        success: function(res) {
            $('#aiAdviceArea').html(`<h4>AI 분석 결과</h4><p>${res.feedback.replace(/\n/g, '<br>')}</p>`);
        }
    });
}




})
