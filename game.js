const scorediv = document.getElementById("score");// HTML'den gerekli elementleri alıyoruz
const timediv = document.getElementById("time");
const startdiv = document.getElementById("start");
const canvas = document.getElementById("canvas");
const rulesdiv = document.getElementById("rules");
const music = new Audio('music.mp3');
const width = window.innerWidth; // Canvas genişliği pencerenin genişliği kadar
const height = window.innerHeight;// Canvas yüksekliği pencerenin yüksekliği kadar
canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext("2d");
ctx.clearRect(0, 0, width, height);

// Fare hareketine göre oyuncunun dönüş açısını hesaplar
canvas.addEventListener("mousemove", (e) => {
    if (playing) {
        console.log(e.pageX);
        var dx = e.pageX - player.x;
        var dy = e.pageY - player.y;
        var theta = Math.atan2(dy, dx);
        theta *= 180 / Math.PI;
        angle = theta;
    }
})

// Fare tıklamasına göre mermi atar
canvas.addEventListener("click", (e) => {
    if (playing) {
        console.log(e.pageX);
        bullets.push(new Circle(player.x, player.y, e.pageX, e.pageY, 5, 'black', 5));
    }
})

// Dairesel nesneleri temsil eden sınıf
class Circle {
    constructor(bx, by, tx, ty, r, c, s) {
        this.bx = bx;
        this.by = by;
        this.x = bx;
        this.y = by;
        this.r = r;
        this.c = c;
        this.tx = tx;
        this.ty = ty;
        this.s = s;
    }
    draw() {
        ctx.fillStyle = this.c;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
    update() {
        var dx = this.tx - this.bx;
        var dy = this.ty - this.by;
        var hp = Math.sqrt(dx * dx + dy * dy);
        this.x += (dx / hp * this.s);
        this.y += (dy / hp * this.s);
    }
    remove() {
        if ((this.x < 0 || this.x > width) || (this.y < 0 || this.y > height)) {
            return true;
        }
        return false;
    }
}
// Kuşları temsil eden sınıf
class Bird {
    constructor(bx, by, tx, ty, r, image, s) {
        this.bx = bx;
        this.by = by;
        this.x = bx;
        this.y = by;
        this.r = r;
        this.image = new Image();
        this.image.src = 'kus.png';
        this.tx = tx;
        this.ty = ty;
        this.s = s;
        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
    }

    draw() {
        if (this.imageLoaded) {
            ctx.drawImage(this.image, this.x - this.r, this.y - this.r, this.r * 2, this.r * 2);
        }
    }

    update() {
        var dx = this.tx - this.bx;
        var dy = this.ty - this.by;
        var hp = Math.sqrt(dx * dx + dy * dy);
        this.x += (dx / hp * this.s);
        this.y += (dy / hp * this.s);
    }

    remove() {
        if ((this.x < 0 || this.x > width) || (this.y < 0 || this.y > height)) {
            return true;
        }
        return false;
    }
}

// Oyuncuyu temsil eden sınıf
class Player {
    constructor(x, y, r, c) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.c = c;
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle * Math.PI / 180);
        ctx.fillStyle = this.c;
        ctx.beginPath();
        ctx.arc(0, 0, this.r, 0, Math.PI * 2);
        ctx.fillRect(0, -(this.r * .4), this.r + 30, this.r * 0.8);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
        // Oyuncu dış görünümü 
        ctx.fillStyle = "black";
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const rectWidth = 25;
        const rectHeight = 60;
        const halfRectWidth = rectWidth / 2;
        const halfRectHeight = rectHeight / 2;
        ctx.fillRect(centerX - halfRectWidth, centerY - halfRectHeight, rectWidth, rectHeight);
        ctx.fillRect(centerX - 12, centerY + halfRectHeight, 10, 80);
        ctx.fillRect(centerX + 2, centerY + halfRectHeight, 10, 80);
        ctx.fillRect(centerX - 5, centerY - halfRectHeight - 20, 12, 20);
        ctx.beginPath();
        ctx.arc(centerX, centerY - halfRectHeight - 30, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

    }
}

// Çarpışma kontrol fonksiyonu
function collision(x1, y1, r1, x2, y2, r2) {
    var dx = x1 - x2;
    var dy = y1 - y2;
    var hp = Math.sqrt(dx * dx + dy * dy);
    if (hp < (r1 + r2)) {
        return true;
    }
    return false;

}

// Oyun döngüsü
function animate() {
    if (playing) {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, width, height);
        // İsabet kontrol ediliyor
        birds.forEach((bird, e) => {
            bullets.forEach((bullet, b) => {
                if (collision(bird.x, bird.y, bird.r, bullet.x, bullet.y, bullet.r)) {
                    birds.splice(e, 1);
                    score += 5;
                    addBirds();
                }
            });

            if (bird.remove()) {
                birds.splice(e, 1);
                addBirds();
            }
            bird.update();
            bird.draw();
        });

        bullets.forEach((bullet, b) => {
            if (bullet.remove()) {
                bullets.splice(b, 1);
            }
            bullet.update();
            bullet.draw();
        });
        player.draw();
        scorediv.innerHTML = "Skor: " + score;// Skor div'ine skor yazılıyor

        var remainingTime = Math.max(0, endTime - Date.now());
        var minutes = Math.floor(remainingTime / (1000 * 60));
        var seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
        timediv.innerHTML = "Zaman: " + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;// Zaman div'ine zaman yazılıyor

        // Zaman bittiğinde oyunu durdur
        if (remainingTime <= 0) {
            stopGame();
        }
    }
}

// Kuş ekleme fonksiyonu
function addBirds() {
    for (var i = birds.length; i < maxbird; i++) {
        var randomY1 = Math.random() * (height - 200) + 100; // Y1 rastgele yükseklik 
        var randomY2 = Math.random() * (height - 200) + 100; // Y2 rastgele yükseklik 
        birds.push(new Bird(10, randomY1, player.x, player.y - 485, 25, 'kus.png', 1)); // Sol taraftaki kuş
        birds.push(new Bird(width - 10, randomY2, player.x, player.y - 485, 25, 'kus.png', 1)); // Sağ taraftaki kuş
    }
}

// Oyun başlatma fonksiyonu
function init() {
    playing = true;
    music.play();
    angle = 0;
    score = 0;
    bullets = [];
    birds = [];
    maxbird = 1;
    player = new Player(width / 2, height / 2, 20, 'black');
    addBirds();
    endTime = Date.now() + 60000; // 1 dakika (ms cinsinden)

    animate();
    startdiv.classList.add("hidden");
    rulesdiv.classList.add("hidden");

}
// Oyun kurallarını gösteren fonksiyon
function rules() {
    alert("== OYUN KURALLARI ==\n\n" +
        "- Fare kullanılarak oynanır.\n" +
        "- Oyuncuyu kontrol etmek için fare hareket ettirilir.\n" +
        "- Oyuncu, sol tık ile otomatik olarak ateş eder.\n" +
        "- Hedefleri vurarak puan kazanabilirsiniz.\n" +
        "- Her isabetli vuruş +5 puan.\n" +
        "- Oyunun amacı, süre dolmadan mümkün olduğunca yüksek puan elde etmektir.\n" +
        "- Süre dolunca oyun sona erer ve puanınız ekranda görüntülenir.\n" +
        "- Başlamak için 'Başla' düğmesine tıklayın.\n" +
        "- İyi eğlenceler!");
}

// Oyunu durdurma fonksiyonu
function stopGame() {
    playing = false;
    ctx.clearRect(0, 0, width, height);
    startdiv.classList.remove("hidden");
    rulesdiv.classList.remove("hidden");
}

// Oyun için gerekli değişkenlerin tanımlanması
var playing = true;
var player, angle, bullets, birds, maxbird, score;
//init();
