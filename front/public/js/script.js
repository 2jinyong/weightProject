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

    
    $('#bmiBtn').click(function() {
        // 1. 입력값 가져오기
        const data = {
            height: $('#height').val(),
            weight: $('#weight').val()
        };

        // 2. 데이터가 잘 담겼는지 로그 찍어보기
        console.log("전송 데이터:", data);

        // 3. AJAX 전송
        $.ajax({
            type: 'POST',
            url: 'http://localhost:8080/api/bmi',
            contentType: 'application/json', // 스프링이 JSON으로 인식하게 함
            data: JSON.stringify(data),      // 반드시 문자열로 변환
            success: function(res) {
                console.log('스프링 대답:', res);
                alert("서버 응답 성공!");
            },
            error: function(xhr) {
                console.error("에러 발생! 상태 코드:", xhr.status);
            }
        });
    });







})
