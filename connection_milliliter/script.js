// import * as constVarlue from './constant';

const GAME_FILE = 'FILE'
const GAME_ALIVE = 'ALIVE'
const GAME_WIN = 'WIN'
const LAST_BTN = 'lastBtn'
const START_BTN = 'startBtn'
const NEXT_BTN = 'nextBtn'
const HINT_BTN = 'hintBtn'
const RECORD_BTN = 'recordBtn'
const myCanvas = document.querySelector(".myCanvas");
const gameArea = document.querySelector(".game_area");
const canvas = [...document.querySelectorAll(`canvas`)];
const svg = document.querySelector(".drawingArea");
let line = svg.querySelector(".line");
const overlay = document.querySelector('.overlay');
const hint = document.querySelector('.hintContainer');
const closeHint = document.querySelector('.closeHintBtn');
const milliliterHint = hint.querySelector('.milliliterHint')
const literHint = hint.querySelector('.literHint')
const gameBtn = [...document.querySelectorAll(`.gameBtn *`)];
const gameRule = document.querySelector('.gameRule');
const topic = document.querySelector('.topic');
const levelLimit = document.querySelector('.levelBtn').children.length;
const leftContainer = document.querySelector('.left');
const rightContainer = document.querySelector('.right');
const milliliterContainer = document.querySelector('.milliliter_container');
const litersContainer = document.querySelector('.right>.water_container');
let i = 0;
while (i<4){
    const clonedMilliliterContainer = milliliterContainer.cloneNode(true);
    const clonedLitersContainer = litersContainer.cloneNode(true);
    leftContainer.appendChild(clonedMilliliterContainer);
    rightContainer.appendChild(clonedLitersContainer);
    i++;
}
const leftWater = [...document.querySelectorAll(`.left .milliliter_container .water_container .water`)];
const rightWater = [...document.querySelectorAll(`.right .water_container .water`)];
const milliliterDots = [...document.querySelectorAll(`.milliliterDots li`)];
const literDots = [...document.querySelectorAll(`.literDots li`)];
const allDots = [...milliliterDots, ...literDots];
const firework_sound = document.getElementById('win');
const fireworkContainer = document.querySelector('#firework-container');
const fireworksUrl = './assets/images/fireworks.gif';
let level = 0, lives = 3;
let act = '', start = '', end = '';
let gameState = GAME_FILE;
let winLevelArr = [];
let topic_explan = {1: `毫公升連連看`};
let liters, milliliters = [];
let drawing = false;
let record = {'start': []
              , 'end': []
              , 'result': []
             };


gameBtn.forEach((item) => {
    item.addEventListener('click', (e) => {
        let className = e.target.parentElement.classList.value;
        if (className.includes(`levelBtn`)){
            level = parseInt(e.target.textContent);
            changeLevel();
        }
        else{
            act = e.target.id;
            if (act === LAST_BTN){
                backLevel();
            }
            else if (act === NEXT_BTN){
                goLevel();
            }
            else if (act === START_BTN){
                startGame();
            }
            else if (act === RECORD_BTN){
                loadRecord();
            }
            else if (act === HINT_BTN){
                showHint();
            }
        }
    });
});

function backLevel() {
    if (level<=1) {
        level = levelLimit;
    }
    else {
        level -= 1;
    }
    changeLevel();
}

function goLevel() {
    if (level>=levelLimit) {
        level = 1;
    }
    else {
        level += 1;
    }
    changeLevel();
}

function startGame() {
    if (gameState===GAME_ALIVE){
        return
    }
    if (level===0){
        level = 1;
        $(gameBtn[0]).addClass('active');
    }
    gameState = GAME_ALIVE;
    gameRule.style.display = 'none';
    getTopic();
    setLives(lives);
    record = {'start': []
              , 'end': []
              , 'result': []
             };
    line = svg.querySelector(".line");
    liters = getRandomNumber(0, 2000, 100, 5);
    milliliters = [];
    shuffle([...liters]).forEach((item, index) =>{
        if (item > 1000){
            milliliters.push(1000);
            milliliters.push(item-1000);
        }
        else{
            milliliters.push(0);
            milliliters.push(item);
        }
        $(milliliterDots[index]).addClass(`${item}`);
    })
    for (let i=0; i<5; i++) {
        const liter = liters[i];
        rightWater[i].style.height = `${((liter)/ 2000)*100}%`;
        $(literDots[i]).addClass(`${liter}`)
        leftWater[i].style.height = `${((milliliters[i])/ 1000)*100}%`;
        leftWater[leftWater.length - (i+1)].style.height = `${((milliliters[leftWater.length - (i+1)])/ 1000)*100}%`;
        milliliterHint.appendChild(document.querySelectorAll('.milliliter_container .water_container')[i].cloneNode(true));
        milliliterHint.appendChild(document.querySelectorAll('.milliliter_container .water_container')[i].cloneNode(true));
        literHint.appendChild(document.querySelectorAll('.right>.water_container')[i].cloneNode(true));
        literHint.appendChild(document.querySelectorAll('.right>.water_container')[i].cloneNode(true));
        literHint.appendChild(document.querySelectorAll('.right>.water_container')[i].cloneNode(true));
        literHint.appendChild(document.querySelectorAll('.right>.water_container')[i].cloneNode(true));
    }   

    const milliliterHintWater = [...document.querySelectorAll(`.milliliterHint .water_container .water`)]
    const milliliterHintWaterContainer = [...document.querySelectorAll(`.milliliterHint .water_container .milliliter`)]
    const literHintWater = [...document.querySelectorAll(`.literHint .water_container .water`)]
    const literHintWaterContainer = [...document.querySelectorAll(`.literHint .water_container .liters`)]
    for (let i=1; i<11; i++) {
        milliliterHintWater[i-1].style.height = `${i*10}%`;
        milliliterHintWaterContainer[i-1].textContent = i*100;
        literHintWater[i-1].style.height = `${i*5}%`;
        literHintWaterContainer[i-1].textContent = i*100;
        literHintWater[literHintWater.length+(i*-1)].style.height = `${(literHintWater.length+((i-1)*-1))*5}%`;
        literHintWaterContainer[literHintWater.length+(i*-1)].textContent = (literHintWater.length+((i-1)*-1))*100;
    }

}

function drawView() {
    const yStart = 75;
    milliliterDots.forEach((dot)=>{
         dot.addEventListener("mousedown", (event) => {
            start = event.target.className;
            record.start.push(start);
            const {pageX: offsetX , pageY: offsetY} = event
            if (line.className.baseVal.includes('wrongLine')){
                $(line).removeClass('wrongLine');
            }
            line.setAttribute("x1", offsetX);
            line.setAttribute("y1", offsetY-yStart);
            line.setAttribute("x2", offsetX);
            line.setAttribute("y2", offsetY-yStart);
            drawing = true;
        });
     })
    
     gameArea.addEventListener("mousemove", (event) => {
      if (!drawing) return;
      const {pageX: offsetX , pageY: offsetY} = event
      line.setAttribute("x2", offsetX);
      line.setAttribute("y2", offsetY-yStart);
    });

    literDots.forEach((dot)=>{
        dot.addEventListener("mouseup", (event) => {
            if (!drawing) return;
            end = event.target.className;
            checkAnswer();
            record.end.push(end);
            drawing = false;
        });
    });
    // requestAnimationFrame(()=>drawView());
};

function checkAnswer() {
    if (gameState !== GAME_ALIVE){
        return
    }
    if (start === end){
        // gameState = GAME_WIN;
        // winLevelArr.push(level);
        document.getElementById('correct').play();
        document.getElementById('bingo').style.display = 'block';
        record.result.push('Ｏ');
        $(line).addClass('correctLine');
        $(line).removeClass('line');
        line = svg.querySelector(".line");
        // set_off_fireworks();
        setTimeout(()=>{document.getElementById('bingo').style.display = 'none';}, 500);
    }
    else {
        record.result.push('Ｘ');
        document.getElementById('wrong').play();
        document.getElementById('dada').style.display = 'block';
        $(line).addClass('wrongLine');
        lives -= 1;
        setLives(lives)
        setTimeout(()=>{document.getElementById('dada').style.display = 'none';}, 500);
        // $(gameBtn[level-1]).removeClass('bingo');
        // winLevelArr.pop(level);
        // $(gameBtn[level-1]).addClass('active');
    }
}

function changeLevel() {
    if (level === 1){
    }
    else if (level === 2){
    }
    else if (level === 3){
    }
    else if (level === 4){
    }
    else if (level === 5){
    }
    resetGame();
}

function resetGame(){
    gameState = GAME_FILE;
    gameBtn.forEach((item, index)=>{
        $(item).removeClass('active');
        if ($.inArray(index+1, winLevelArr) !== -1) {
            $(item).addClass('bingo');
        }
        else if (index+1 === level){
            $(item).addClass('active');
        }
    })
    gameRule.style.display = 'block'
    $('.literDots li').removeClass();
    $('.milliliterDots li').removeClass();
    $('svg line').removeClass();
    $('svg line').addClass('line');
    $('svg line').each((index, line)=>{
        line.setAttribute('x1', '0');
        line.setAttribute('y1', '0');
        line.setAttribute('x2', '0');
        line.setAttribute('y2', '0');
    })
}

function loadRecord(){
}
function showHint(){
    if (lives > 0)return
    if (overlay.style.display === 'block'){
        overlay.style.display = 'none';
        
    }
    else{
        overlay.style.display = 'block';
    }
}

function getTopic(){
    topic.textContent = topic_explan[level];
}

function setLives(lives){
    if (lives === $('.lives').children().length || lives<0) return
    if (lives < $('.lives').children().length) {
        $('.lives > :last-child').remove();
        return
    }
    for (let i = 0; i <lives; i++){
        const livesImg = $('<img>')
        .attr('src', './assets/images/lives.svg')
        .attr('alt', 'lives image')
        .attr('width', '60')
        .attr('height', 'auto')
        .css('margin-right', '-30px');
        $('.lives').append(livesImg);
    }
}
function set_off_fireworks(){
    firework_sound.currentTime = 1.5;
    firework_sound.play();
    fireworkContainer.style.display = 'block';
    showFirework();
    setTimeout(()=>{firework_sound.pause()}, 3000);
    let count = 0;
    while (count < 2500){
        let milliseconds =  Math.floor(Math.random() * (800 - 400 + 1)) + 400;
        count += milliseconds;
        setTimeout(showFirework, count)
    }
    setTimeout(() => {
        fireworkContainer.style.display = 'none';
    }, count)
} 

function showFirework() {
    for (let i = 0; i < 5; i++) {
        let width = 100 * (Math.random()*2.5);
        const fireworksElement = document.createElement('img');
        fireworksElement.src = fireworksUrl;
        fireworksElement.style.position = 'absolute';
        fireworksElement.style.width = `${width}px`;
        fireworksElement.style.height = 'auto';
        fireworksElement.style.left = Math.floor(Math.random() * (fireworkContainer.clientWidth-width)) + 'px';
        fireworksElement.style.top = Math.floor(Math.random() * (fireworkContainer.clientHeight-width*1.5)) + 'px';
        fireworkContainer.appendChild(fireworksElement);
    }
    setTimeout(removeFirework, 1194);
}  

function removeFirework() {
    for (let i = 0; i < 5; i++) {
        fireworkContainer.removeChild(fireworkContainer.children[0]);
	}
}

function getRandomNumber(start, end, tolerance, times=1) {
    let result = new Set();
    while(result.size < times) {
        const range = Math.ceil((end - start) / tolerance);
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * (range + 1));
        } while (start + randomIndex * tolerance === 0)
        if (times === 1){
            return start + randomIndex * tolerance;
        }
        const number = start + randomIndex * tolerance;
        result.add(number)
    }
    return [...result]
  }

  function shuffle(originArray){
    // Fisher-Yates shuffle algorithm
    let array = [...originArray]
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
  
closeHint.addEventListener('click', showHint);
drawView();