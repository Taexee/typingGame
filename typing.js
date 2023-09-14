const words = 'He that humbleth himself wishes to be exalted'.split(' ');
const wordsCount = words.length;
const gameTime = 30 * 1000;
window.timer = null;
window.gameStart = null;

function addClass(el,name) {
    el.className += ' '+name;
}

function removeClass(el,name) {
    el.className = el.className.replace(' '+name,'');
}

// 랜덤으로 words 인덱스 반환
function randomWord() {
    const randomIndex = Math.ceil(Math.random() * wordsCount)
    return words[randomIndex -1];
}

// 문자열 하나씩
function formatWord(word) {
    return `<div class="word"><span class="letter">${word.split('').join('</span><span class="letter">')}</span></div>`;
}

// 게임 시작
function newGame() {
    const game = document.getElementById('game');
    removeClass(game, ' over');
    document.getElementById('words').innerHTML = '';
    // 랜덤으로 word 생성
    for (let i = 0; i < 200; i++) {
        document.getElementById('words').innerHTML += formatWord(randomWord());
    }
    addClass(document.querySelector('.word'), 'current');
    addClass(document.querySelector('.letter'), 'current');
    document.getElementById('info').innerHTML = (gameTime / 1000) + '';
    window.timer = null;
    
}

// wpm 구하기
function getWpm() {
    const words = [...document.querySelectorAll('.word')];
    const lastTypedWord = document.querySelector('.word.current');
    const lastTypedWordIndex = words.indexOf(lastTypedWord) + 1;
    const typedWords = words.slice(0, lastTypedWordIndex);
    const correctWords = typedWords.filter(word => {
        const letters = [...word.children];
        const incorrectLetters = letters.filter(letter => letter.className.includes('incorrect'));
        const correctLetters = letters.filter(letter => letter.className.includes('correct'));
        return incorrectLetters.length === 0 && correctLetters.length === letters.length;
    });
  return correctWords.length / gameTime * 60000;
}

// 게임 종료
function gameOver() {
    // 타이머 종료
    clearInterval(window.timer);
    addClass(document.getElementById('game'), 'over');
    const result = getWpm();
    document.getElementById('info').innerHTML = `WPM: ${result}`;
}

// 타이핑 확인
document.getElementById('game').addEventListener('keyup', ev => {
    // console.log(ev);
    const key = ev.key;
    const currentWord = document.querySelector('.word.current');
    const currentLetter = document.querySelector('.letter.current');
    const expected = currentLetter?.innerHTML || ' ';
    const isLetter = key.length === 1 && key !== ' ';
    const isSpace = key === ' ';
    const isBackspace = key === 'Backspace';
    const isFirstLetter = currentLetter === currentWord.firstChild;
    const isFirstWord = currentLetter === document.getElementById('words').firstChild.firstChild;
    const isExtra = document.querySelector(".letter.incorrect.extra");
    const isExtra2 = document.querySelector(".letter.extra");

    if(document.querySelector('#game.over')) {
        return;
    }


    console.log({key,expected});

    if(!window.timer && isLetter) {
        window.timer = setInterval(() => {
            if(!window.gameStart) {
                window.gameStart = (new Date()).getTime();
            }
            const currentTime = (new Date()).getTime();
            const msPassed = currentTime - window.gameStart;
            const sPassed = Math.round(msPassed / 1000);
            const sLeft = (gameTime / 1000 ) - sPassed;
            if(sLeft <= 0) {
                gameOver();
                return;
            }
            document.getElementById('info').innerHTML = sLeft + '';
            
        }, 1000);
    }

    // 입력값과 문자열 비교해 correct & incorrect
    if(isLetter) {
        if(currentLetter){
            //alert(key === expected ? 'ok' : 'wrong');
            addClass(currentLetter, key === expected ? 'correct' : 'incorrect');
            removeClass(currentLetter, 'current'); // current 제거
            if(currentLetter.nextSibling){
                addClass(currentLetter.nextSibling, 'current'); // 옆 글자 current
            }
        } else { // 입력 잘못했을때 단어 길이를 넘어가면 추가로 붙여줌
            const incorrectLetter = document.createElement('span');
            incorrectLetter.innerHTML = key;
            incorrectLetter.className = 'letter incorrect extra';
            currentWord.appendChild(incorrectLetter);
        }
    }

    // 단어입력중 스페이바 누르면 모두 incorrect, 다음 단어로 이동
    if(isSpace) {
        if (expected !== ' ') {
            const lettersToInvalidate = [...document.querySelectorAll('.word.current .letter:not(.correct)')];
            lettersToInvalidate.forEach(letter => {
            addClass(letter, 'incorrect');
            });
        }

        removeClass(currentWord, 'current');
        addClass(currentWord.nextSibling, 'current'); // 다음 단어에 current 넘김 
        
        if(currentLetter) {
            removeClass(currentLetter, 'current');
        }

        addClass(currentWord.nextSibling.firstChild, 'current'); // 첫글자 current달기
    }

    // 백스페이스
    if(isBackspace) {
        // 단어 길이 넘어가는 extra 삭제
        if(isExtra){
            currentWord.removeChild(isExtra);
        }

        // 이전 단어, 마지막 문자로 이동, 첫 단어 첫 글자 아닌 것
        if(currentLetter && isFirstLetter && !isFirstWord) {
            removeClass(currentWord, 'current');
            addClass(currentWord.previousSibling, 'current');
            removeClass(currentLetter, 'current');
            addClass(currentWord.previousSibling.lastChild, 'current');
            removeClass(currentWord.previousSibling.lastChild, 'incorrect');
            removeClass(currentWord.previousSibling.lastChild, 'correct');
        }

        // 이전 글자로 이동
        if(currentLetter && !isFirstLetter) {
            removeClass(currentLetter, 'current');
            addClass(currentLetter.previousSibling, 'current');
            removeClass(currentLetter.previousSibling, 'incorrect');
            removeClass(currentLetter.previousSibling, 'correct');
        }

        // 단어 다 입력 후 백스페이스
        if(!currentLetter) {
            addClass(currentWord.lastChild, 'current');
            removeClass(currentWord.lastChild, 'incorrect');
            removeClass(currentWord.lastChild, 'correct');
        }

        
    }

    // 단어 스크롤
    if(currentWord.getBoundingClientRect().top > 250) {
        const word = document.getElementById('words');
        const margin = parseInt(words.style.marginTop || '0px');
        words.style.marginTop = (margin - 35) + 'px';
    }

    // 커서 움직이기
    const nextLetter = document.querySelector('.letter.current');
    const nextWord = document.querySelector('.word.current');
    const cursor = document.getElementById('cursor');
    cursor.style.top = (nextLetter || nextWord).getBoundingClientRect().top + 2 + 'px';
    cursor.style.left = (nextLetter || nextWord).getBoundingClientRect()[nextLetter ? 'left' : 'right'] + 'px';
});

document.getElementById('newGameBtn').addEventListener('click', () => {
    gameOver();
    newGame();
});

newGame();