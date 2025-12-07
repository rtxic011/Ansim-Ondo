// ==========================================
// 1. 데이터 정의 (JSON 구조 기반)
// ==========================================

// 2.1 개인 건강 및 인적 정보 (고정 데이터)
const userData = {
    username: "김복자",
    age: 75,
    disease: ["고혈압", "당뇨병"],
    is_alone: true,
    house_type: "옥탑방",        // 열 취약 주거지
    location_outside: true,     // 초기값: 야외
    caregiver_contact: "010-1234-5678"
};

// 2.2 실시간 환경 및 생체 데이터 (가변 데이터 - 시뮬레이션용)
let weatherData = {
    temp: 25.0,             // 기온
    body_temp: 36.5,        // 체온 (핵심 변수)
    humidity: 50,           // 습도
    feels_like_temp: 26.0,  // 체감온도
    heat_index_alert: "없음" // 특보 여부
};

// 자동 시뮬레이션 상태 플래그
let isAutoSimulation = true;

// ==========================================
// 2. 🧠 핵심 로직: 위험 예측 Rule Engine
// ==========================================
function calculateRisk(user, weather) {
    let riskLevel = "안심";
    let advice = "현재 날씨와 건강 상태는 안정적입니다.";
    let cssClass = "safe";
    let icon = "😊";

    // 변수 추출
    const temp = weather.temp;
    const bodyTemp = weather.body_temp;
    const feelsLike = weather.feels_like_temp;
    const isElderly = user.age >= 70;
    const hasDisease = user.disease.length > 0;
    const isOutside = user.location_outside;
    const houseType = user.house_type;
    const alertStatus = weather.heat_index_alert;

    // ---------------------------------------------
    // [Rule Engine 구현 - 기획안 3.2 로직 반영]
    // ---------------------------------------------

    // 1. 위험 (Danger - Red)
    // Rule A: 체온 38도 이상 + (고온 또는 야외) -> 열사병 직전
    if (bodyTemp >= 38.0 && (temp >= 33 || isOutside)) {
        riskLevel = "위험";
        advice = "🚨 체온 38도 이상! 열사병 위험! 즉시 그늘로 이동 후 SOS 버튼을 누르세요.";
        cssClass = "danger";
        icon = "🆘";
    }
    // Rule B: 폭염 경보 + (고령 또는 기저질환)
    else if (alertStatus.includes("경보") && (isElderly || hasDisease)) {
        riskLevel = "위험";
        advice = "🔥 [생명 위협] 폭염 경보 발효 중! 절대 외출 금지. 물을 마시고 휴식하세요.";
        cssClass = "danger";
        icon = "🔥";
    }

    // 2. 주의 (Caution - Yellow)
    // Rule C: 체감온도 30도 이상 + 기저질환자
    else if (feelsLike >= 30 && hasDisease) {
        riskLevel = "주의";
        advice = "💦 기온이 높습니다. 기저질환 악화 우려가 있으니 수분 섭취를 늘리세요.";
        cssClass = "caution";
        icon = "⚠️";
    }
    // Rule D: 폭염 주의보 + (옥탑방 또는 독거)
    else if (alertStatus.includes("주의보") && (houseType === "옥탑방" || user.is_alone)) {
        riskLevel = "주의";
        advice = "🏠 옥탑방/독거 취약 환경입니다. 실내 환기에 유의하고 복지관에 연락하세요.";
        cssClass = "caution";
        icon = "🏠";
    }
    // Rule E: 30도 이상 고온 + 고령자 + 야외 활동
    else if (temp >= 30 && isElderly && isOutside) {
        riskLevel = "주의";
        advice = "🌡️ 어르신, 밖이 덥습니다. 장시간 야외 활동을 멈추고 쉬어가세요.";
        cssClass = "caution";
        icon = "🌤️";
    }

    // 3. 안심 (Safe - Green) : 위 조건에 해당하지 않음
    else {
        // 기본값 유지
    }

    return { riskLevel, advice, cssClass, icon };
}

// ==========================================
// 3. UI 업데이트 및 시뮬레이션 제어
// ==========================================

function updateUI() {
    // 사용자 정보 렌더링
    document.getElementById("u-name").innerText = userData.username;
    document.getElementById("u-age").innerText = userData.age;
    document.getElementById("u-disease").innerText = userData.disease.join(", ");
    document.getElementById("u-house").innerText = userData.house_type;
    
    // 위치 정보 시각화
    const locElem = document.getElementById("u-location");
    locElem.innerText = userData.location_outside ? "야외 활동 중 ☀️" : "실내 휴식 중 🏠";
    locElem.style.color = userData.location_outside ? "#d32f2f" : "#4CAF50";

    // 날씨/생체 데이터 렌더링
    document.getElementById("w-temp").innerText = weatherData.temp.toFixed(1);
    document.getElementById("w-feels").innerText = weatherData.feels_like_temp.toFixed(1);
    document.getElementById("w-humi").innerText = weatherData.humidity;
    document.getElementById("w-alert").innerText = weatherData.heat_index_alert;
    
    // 체온 (중요 변수)
    const bodyElem = document.getElementById("b-temp");
    bodyElem.innerText = weatherData.body_temp.toFixed(1) + " °C";
    // 체온이 높으면 빨간색 강조
    bodyElem.style.color = weatherData.body_temp >= 37.5 ? "#d32f2f" : "#333";

    // 위험도 계산 및 결과 표시
    const result = calculateRisk(userData, weatherData);

    const riskPanel = document.getElementById("risk-panel");
    document.getElementById("risk-level").innerText = result.riskLevel;
    document.getElementById("risk-icon").innerText = result.icon;
    document.getElementById("advice-msg").innerText = result.advice;

    // 클래스 재설정 (애니메이션 효과 위함)
    riskPanel.className = "risk-panel " + result.cssClass;
}

// 4. 시뮬레이션 로직 (랜덤 값 변동)
function startAutoSimulation() {
    setInterval(() => {
        if (!isAutoSimulation) return; // 수동 모드일 땐 중지

        // 랜덤하게 데이터 변동 (현실적인 범위 내)
        // 기온: 28 ~ 36도
        weatherData.temp = parseFloat((28 + Math.random() * 8).toFixed(1));
        // 습도: 40 ~ 80%
        weatherData.humidity = Math.floor(40 + Math.random() * 40);
        // 체온: 36.0 ~ 38.5도 (가끔 위험 수치 나오게)
        weatherData.body_temp = parseFloat((36.0 + Math.random() * 2.5).toFixed(1));
        
        // 파생 변수 계산
        weatherData.feels_like_temp = weatherData.temp + (weatherData.humidity / 20); // 단순화된 공식
        
        // 특보 자동 설정
        if (weatherData.temp >= 35) weatherData.heat_index_alert = "폭염 경보";
        else if (weatherData.temp >= 31) weatherData.heat_index_alert = "폭염 주의보";
        else weatherData.heat_index_alert = "없음";

        updateUI();

    }, 3000); // 3초마다 업데이트
}

// ==========================================
// 5. 시연용 시나리오 강제 설정 (버튼 연결)
// ==========================================

function toggleAutoMode() {
    isAutoSimulation = !isAutoSimulation;
    alert("자동 시뮬레이션 모드: " + (isAutoSimulation ? "ON" : "OFF"));
}

// 버튼 클릭 시 특정 상황을 강제로 만듦
function setScenario(type) {
    isAutoSimulation = false; // 수동 모드로 전환하여 값 고정

    if (type === 'safe') {
        weatherData.temp = 25.0;
        weatherData.body_temp = 36.5;
        weatherData.humidity = 40;
        weatherData.feels_like_temp = 26.0;
        weatherData.heat_index_alert = "없음";
        userData.location_outside = false; // 실내
    } 
    else if (type === 'caution') {
        weatherData.temp = 31.0;
        weatherData.body_temp = 37.2; // 약간 높음
        weatherData.humidity = 60;
        weatherData.feels_like_temp = 32.0;
        weatherData.heat_index_alert = "폭염 주의보";
        userData.location_outside = true; // 야외
    } 
    else if (type === 'danger') {
        weatherData.temp = 35.5;
        weatherData.body_temp = 38.2; // 위험!
        weatherData.humidity = 70;
        weatherData.feels_like_temp = 39.0;
        weatherData.heat_index_alert = "폭염 경보";
        userData.location_outside = true; // 야외
    }
    updateUI();
}

// ==========================================
// 6. SOS 기능 및 초기화
// ==========================================

document.getElementById("sos-btn").addEventListener("click", function() {
    const feedback = document.getElementById("sos-feedback");
    feedback.classList.remove("hidden");
    feedback.innerText = "📡 위치정보 및 건강데이터 전송 중...";
    
    setTimeout(() => {
        alert(`[긴급 알림 전송 완료]\n수신인: ${userData.caregiver_contact}\n내용: ${userData.username}님 체온 ${weatherData.body_temp}°C 위급 상황 발생!`);
        feedback.innerText = "✅ 보호자에게 알림이 전송되었습니다.";
    }, 1000);
});

// 페이지 로드 시 시작
window.onload = function() {
    updateUI();
    startAutoSimulation();
};