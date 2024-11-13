document.addEventListener("DOMContentLoaded", function() {

    var user = prompt("Write your first name:");
    if (user === null || user === ""){
        user = prompt("Please write your first name:");
    } else if (user < 2){
        user = prompt("Please write your first name:");
    } else if (user !== null) {
        document.title = "Happy Birthday " + user + "!";
        document.querySelector("h1").textContent = "Happy Birthday " + user + "!";
    }

    const mic = document.getElementById("mic");
    const cursor = document.getElementById("cursor");
    const flame = document.getElementById("flame");
    const cursorInstructions = document.getElementById("cursorInstructions");
    const micInstructions = document.getElementById("micInstructions");
    micInstructions.style.display = "none";
    cursorInstructions.style.display = "none";
    const instructionsContainer = document.querySelector(".instructions-container");

    let audioContext;
    let micStream;
    let analyser;
    let blowThreshold = 110;
    let flameOpacity = 1;

    function startBlowDetection() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function(stream) {
        
                audioContext = new AudioContext();
                micStream = stream;
                const microphone = audioContext.createMediaStreamSource(stream);

                analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                microphone.connect(analyser);

                listenForBlow();
            })
            .catch(function(err) {
                console.error('Error accessing microphone:', err);
            });
    }

    
    function listenForBlow() {
        const buffer = analyser.frequencyBinCount;
        const data = new Uint8Array(buffer);

        function detectBlow() {
            analyser.getByteFrequencyData(data);

            let s = 0;
            for (let i = 0; i < buffer; i++) {
                s += data[i];
            }
            const averageAmplitude = s / buffer;

            if (averageAmplitude > blowThreshold) {
            
                flameOpacity -= 0.05;
                if (flameOpacity < 0) {
                    flameOpacity = 0;
                }
                flame.style.opacity = flameOpacity;
            }

            requestAnimationFrame(detectBlow);
        }

        detectBlow();
    }

    mic.addEventListener("click", function() {
        micInstructions.style.display = "block";
        cursorInstructions.style.display = "none";
        instructionsContainer.style.display = "none";
        startBlowDetection();
    });

    cursor.addEventListener("click", function() {
        cursorInstructions.style.display = "block";
        micInstructions.style.display = "none";
        instructionsContainer.style.display = "none";
    
        let prevX = null;
        let prevY = null;
        let prevTime = null;

        const flameRadius = 500;

        document.addEventListener("mousemove", function(event) {
            const x = event.clientX;
            const y = event.clientY;

            const inFlameRadius = (
                x >= flame.offsetLeft - flameRadius &&
                x <= flame.offsetLeft + flame.offsetWidth + flameRadius &&
                y >= flame.offsetTop - flameRadius &&
                y <= flame.offsetTop + flame.offsetHeight + flameRadius
            );

            console.log("inFlameRadius: " + inFlameRadius);

            if (inFlameRadius) {
                let speed = 0;
                if (prevX !== null && prevY !== null && prevTime !== null) {
                    const time = performance.now() - prevTime;
                    speed = Math.sqrt(Math.pow(x - prevX, 2) + Math.pow(y - prevY, 2)) / time;
                }

                flameOpacity -= speed * 0.01;
                if (flameOpacity < 0) {
                    flameOpacity = 0;
                }
                flame.style.opacity = flameOpacity;
            }

            prevX = x;
            prevY = y;
            prevTime = performance.now();
        });
    });

    window.addEventListener("beforeunload", function() {
        if (audioContext) {
            audioContext.close();
            micStream.getTracks().forEach(track => track.stop());
        }
    });
});