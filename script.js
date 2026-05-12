const firebaseConfig = {

    apiKey: "AIzaSyBb8VHBBMbpiJdiA8dzTUzxN7u88ogHDzQ",

    authDomain: "the-end-9e3f1.firebaseapp.com",

    databaseURL: "https://the-end-9e3f1-default-rtdb.firebaseio.com",

    projectId: "the-end-9e3f1",

    storageBucket: "the-end-9e3f1.firebasestorage.app",

    messagingSenderId: "520420642669",

    appId: "1:520420642669:web:dd188f71f460ffc2495464"

};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();

let alivePlayers = [];
let timer = null;
let timeLeft = 0;
let paused = true;

const events = [

    "تست للعبه و التحديات باقي ماحطيت شي",
    

];

function toggleAdmin(){
    document.getElementById("adminPanel").classList.toggle("active");
}

function toggleAuction(){
    document.getElementById("auctionPanel").classList.toggle("active");
}

function toggleRules(){
    document.getElementById("rulesModal").classList.toggle("hidden");
}

/* ===================== */
/* إضافة لاعب */
/* ===================== */

function addPlayer(){

    const input = document.getElementById("playerName");
    const name = input.value.trim();

    if(!name) return;

    db.ref("players").push({
        name:name,
        status:"alive"
    });

    input.value = "";

}

/* ===================== */
/* تحديث اللاعبين */
/* ===================== */

db.ref("players").on("value", snap => {

    const grid = document.getElementById("playerGrid");

    grid.innerHTML = "";

    alivePlayers = [];

    const data = snap.val() || {};

    for(let id in data){

        const p = data[id];

        if(p.status === "alive"){
            alivePlayers.push({id, ...p});
        }

        const div = document.createElement("div");

        div.className = "player-card " + (p.status === "dead" ? "dead" : "");

        div.innerHTML = `<h3>${p.name}</h3>`;

        div.onclick = () => {

            db.ref("players/"+id).update({
                status: p.status === "alive" ? "dead" : "alive"
            });

        };

        grid.appendChild(div);

    }

});

/* ===================== */
/* سحب حدث */
/* ===================== */

function triggerEvent(){

    if(alivePlayers.length === 0) return;

    const target = alivePlayers[Math.floor(Math.random()*alivePlayers.length)];

    const randomEvent = events[Math.floor(Math.random()*events.length)];

    const inputTime = document.getElementById("eventTime").value || 10;

    timeLeft = Number(inputTime);

    db.ref("current").set({

        player: target.name,
        event: randomEvent,
        time: timeLeft

    });

}

/* ===================== */
/* التايمر */
/* ===================== */

function startTimerManual(){

    paused = false;

    clearInterval(timer);

    timer = setInterval(() => {

        if(paused) return;

        if(timeLeft <= 0){
            clearInterval(timer);
            return;
        }

        timeLeft--;

        db.ref("current/time").set(timeLeft);

    },1000);

}

function pauseTimer(){
    paused = true;
}

function resumeTimer(){
    paused = false;
}

/* ===================== */
/* تحديث الحدث */
/* ===================== */

db.ref("current").on("value", snap => {

    const data = snap.val();

    if(!data) return;

    document.getElementById("eventBox").innerHTML =
    `<h3>${data.player}</h3><p>${data.event}</p>`;

    document.getElementById("timer").innerText =
    data.time < 10 ? "0"+data.time : data.time;

    timeLeft = data.time;

});

/* ===================== */
/* التوقعات */
/* ===================== */

function sendPrediction(){

    const user = document.getElementById("userName").value.trim();
    const guess = document.getElementById("prediction").value.trim();

    if(!user || !guess) return;

    db.ref("predictions").push({
        user:user,
        guess:guess
    });

    document.getElementById("userName").value = "";
    document.getElementById("prediction").value = "";

}

db.ref("predictions").on("value", snap => {

    const list = document.getElementById("predictionList");

    list.innerHTML = "";

    const data = snap.val() || {};

    for(let id in data){

        const p = data[id];

        const div = document.createElement("div");

        div.innerHTML = `
        <div style="padding:8px;margin:6px;
        background:rgba(255,255,255,0.05);
        border-right:3px solid gold">
        <b>${p.user}</b> يتوقع ${p.guess}
        </div>`;

        list.prepend(div);

    }

});

/* ===================== */
/* إعادة الوقت */
/* ===================== */

function restartTimer(){

    const newTime =
    Number(document.getElementById("eventTime").value) || 10;

    timeLeft = newTime;

    db.ref("current").update({
        time:newTime
    });

    clearInterval(timer);

    paused = false;

    startTimerManual();

}

/* ===================== */
/* تصفير التوقعات */
/* ===================== */

function resetPredictions(){

    if(confirm("حذف كل التوقعات؟")){

        db.ref("predictions").remove();

    }

}

/* ===================== */
/* تصفير النظام */
/* ===================== */

function resetSystem(){

    if(confirm("تصفير كامل للنظام؟")){

        db.ref("/").remove();

    }

}