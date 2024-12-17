const toggleSwitch = document.querySelector('.toggle-switch');
const modeButtons = document.querySelectorAll('.mode-button');

toggleSwitch.addEventListener('click', () => {
    toggleSwitch.classList.toggle('active');
});

modeButtons.forEach(button => {
    button.addEventListener('click', () => {
        modeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

document.querySelector('.search-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        // 검색 기능 구현 부분
        console.log('검색어:', this.value);
    }
});

const loginButton = document.querySelector('.login-button');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const closeButtons = document.querySelectorAll('.close');
const showSignupButton = document.getElementById('showSignupButton');

loginButton.onclick = function() {
    loginModal.style.display = "block";
}

closeButtons.forEach(button => {
    button.onclick = function() {
        loginModal.style.display = "none";
        signupModal.style.display = "none";
    }
});

window.onclick = function(event) {
    if (event.target == loginModal) {
        loginModal.style.display = "none";
    }
    if (event.target == signupModal) {
        signupModal.style.display = "none";
    }
}

document.getElementById('loginForm').onsubmit = function(e) {
    e.preventDefault();
    // 여기에 로그인 처리 로직을 추가할 수 있습니다.
    console.log('로그인 시도');
    loginModal.style.display = "none";
}

showSignupButton.onclick = function() {
    loginModal.style.display = "none";
    signupModal.style.display = "block";
}

document.getElementById('signupForm').onsubmit = function(e) {
    e.preventDefault();
    // 여기에 회원가입 처리 로직을 추가할 수 있습니다.
    console.log('회원가입 시도');
    signupModal.style.display = "none";
}

// 모달 관련 함수들
function openModal(modalId) {
    document.getElementById(modalId).style.display = "block";
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

// 모든 모달과 닫기 버튼에 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', function() {
    var modals = document.getElementsByClassName('modal');
    for (var i = 0; i < modals.length; i++) {
        var closeBtn = modals[i].getElementsByClassName('close')[0];
        closeBtn.onclick = function() {
            this.parentElement.parentElement.style.display = 'none';
        }
    }
    // 검색 폼 제출 이벤트 처리
document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var searchQuery = this.querySelector('input[name="search_query"]').value;
        openChatModal(searchQuery);
    });
});

// 채팅 버튼 클릭 이벤트
// document.querySelector('.chat-button').addEventListener('click', function() {
//     openModal('chatModal');
// });

function openChatModal(initialQuery = '') {
    openModal('chatModal');
    if (initialQuery) {
        document.getElementById('user-input').value = initialQuery;
        sendMessage();
    }
}

function sendMessage() {
    var userInput = document.getElementById('user-input').value;
    if (!userInput.trim()) return;

    var model = document.getElementById('model-select').value;

    addMessage('user', userInput);

    fetch('/chat/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
        },
        body: JSON.stringify({query: userInput, model: model})
    })
    .then(response => response.json())
    .then(data => {
        addMessage('assistant', data.answer);
        if (data.sources) {
            addSources(data.sources);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        addMessage('system', '오류가 발생했습니다. 다시 시도해 주세요.');
    });

    document.getElementById('user-input').value = '';
}

function addMessage(role, content) {
    var messageDiv = document.createElement('div');
    messageDiv.className = role;
    messageDiv.textContent = content;
    document.getElementById('chat-messages').appendChild(messageDiv);

    // 스크롤을 최신 메시지로 이동
    var chatContainer = document.getElementById('chat-messages');
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function addSources(sources) {
    var sourcesDiv = document.createElement('div');
    sourcesDiv.className = 'sources';
    sourcesDiv.innerHTML = '<h4>참고한 페이지:</h4>';
    sources.forEach((source, index) => {
        sourcesDiv.innerHTML += `<p><strong>출처 ${index + 1}:</strong> ${source.source}<br>${source.text}...</p>`;
    });
    document.getElementById('chat-messages').appendChild(sourcesDiv);
}

// 윈도우 클릭 이벤트 (모달 외부 클릭 시 닫기)
window.onclick = function(event) {
    if (event.target.className === 'modal') {
        event.target.style.display = "none";
    }
}
