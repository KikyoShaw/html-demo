(function () {
    let u = {};
  // 绘画图片
    u.drawImage=function (id,imgSrc) {
      console.log(id,imgSrc)
    var c = document.getElementById(id);
    console.log(JSON.stringify(c))
    var ctx = c.getContext("2d");
    if (!c || !c.getContext) return;
    let img = new Image();
    img.src = imgSrc;
    console.log(imgSrc)
    // 图片加载完再开始绘制图片
    img.onload = function () {
      console.log("draw");
      let imgRect = coverImg(c.width, c.height, img.width, img.height); //与cover相似的图片自适应
      ctx.drawImage(
        img,
        imgRect.sx,
        imgRect.sy,
        imgRect.sWidth,
        imgRect.sHeight,
        0,
        0,
        c.width,
        c.height
      );
    };
  }
// 绘制流星雨
  u.drawMeteor=function (id) {
    console.log(id)
    let cvs = document.getElementById(id);
    let ctx = cvs.getContext("2d");
    let meteorShower = new MeteorShower(cvs, ctx);
    meteorShower.start();
  }

  /**
   * 图片自适应
   * @param {Number} box_w 固定盒子的宽, box_h 固定盒子的高
   * @param {Number} source_w 原图片的宽, source_h 原图片的高
   * @return {Object} {截取的图片信息}，对应drawImage(imageResource, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)参数
   */
  function coverImg(box_w, box_h, source_w, source_h) {
    var sx = 0,
      sy = 0,
      sWidth = source_w,
      sHeight = source_h;
    let boxScale = box_w / box_h;
    let sourceScale = source_w / source_h;
    if (sourceScale > boxScale) {
      sWidth = (box_w * source_h) / box_h;
      sx = (source_w - sWidth) / 2;
    } else if (sourceScale < boxScale) {
      sHeight = (box_h * source_w) / box_w;
      sy = (source_h - sHeight) / 2;
    }
    return { sx, sy, sWidth, sHeight };
  }

  //坐标
  class Crood {
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }

    setCrood(x, y) {
      this.x = x;
      this.y = y;
    }

    copy() {
      return new Crood(this.x, this.y);
    }
  }

  // 流星

  class ShootingStar {
    constructor(
      init = new Crood(),
      final = new Crood(),
      size = 30,
      speed = 100,
      onDistory = null
    ) {
      this.init = init;   // 初始位置
      this.final = final;   // 最终位置
      this.size = size;  // 大小
      this.speed = speed;      // 速度：像素/s
      this.dur =(Math.sqrt(Math.pow(this.final.x - this.init.x, 2) +Math.pow(this.final.y - this.init.y, 2) ) *1000) /this.speed; // 飞行总时间
      this.pass = 0;  // 已过去的时间
      this.prev = this.init.copy(); // 上一帧位置
      this.now = this.init.copy();  // 当前位置
      this.onDistory = onDistory;
    }

    draw(ctx, delta) {
      this.pass += delta;
      this.pass = Math.min(this.pass, this.dur);
      let percent = this.pass / this.dur;
      this.now.setCrood(
        this.init.x + (this.final.x - this.init.x) * percent,
        this.init.y + (this.final.y - this.init.y) * percent
      );

      // canvas
      ctx.strokeStyle = "#fff";
      ctx.lineCap = "round";
      ctx.lineWidth = this.size;
      ctx.beginPath();
      ctx.moveTo(this.now.x, this.now.y);
      ctx.lineTo(this.prev.x, this.prev.y);
      ctx.stroke();
      this.prev.setCrood(this.now.x, this.now.y);
      if (this.pass === this.dur) {
        this.distory();
      }
    }

    distory() { this.onDistory && this.onDistory(); }
  }

  class MeteorShower {
    constructor(cvs, ctx) {
      this.cvs = cvs;
      this.ctx = ctx;
      this.stars = [];
      this.T;
      this.stop = false;
      this.playing = false;
    }

    createStar() {
      let angle = Math.PI / 3;
      let distance = Math.random() * 400;
      let init = new Crood(
        (Math.random() * this.cvs.width) | 0,
        (Math.random() * 100) | 0
      );

      let final = new Crood(
        init.x + distance * Math.cos(angle),
        init.y + distance * Math.sin(angle)
      );

      let size = Math.random() * 3;
      let speed = Math.random() * 400 + 50;
      let star = new ShootingStar(init, final, size, speed, () => {
        this.remove(star);
      });

      return star;
    }

    remove(star) {
      this.stars = this.stars.filter((s) => {
        return s !== star;
      });
    }

    update(delta) {
      if (!this.stop && this.stars.length < 20) {
        this.stars.push(this.createStar());
      }

      this.stars.forEach((star) => {
        star.draw(this.ctx, delta);
      });
    }

    tick() {
      if (this.playing) return;
      this.playing = true;
      let now = new Date().getTime();
      let last = now;
      let delta;
      let _tick = () => {
        if (this.stop && this.stars.length === 0) {
          cancelAnimationFrame(this.T);
          this.playing = false;
          return;
        }

        delta = now - last;
        delta = delta > 500 ? 30 : delta < 16 ? 16 : delta;
        last = now;
        // console.log(delta);
        this.T = requestAnimationFrame(_tick);
        this.ctx.save();
        this.ctx.fillStyle = "rgba(0,0,0,0.8)";
        this.ctx.globalCompositeOperation = "destination-in";
        // 每一帧用 “半透明” 的背景色清除画布
        this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);
        // drawImage(this.cvs,this.ctx)
        this.ctx.restore();
        this.update(delta);
      };
      _tick();
    }

    start() {
      this.stop = false;

      this.tick();
    }
    stop() {
      this.stop = true;
    }
  }

  window.$canvas = u;
})(window);
