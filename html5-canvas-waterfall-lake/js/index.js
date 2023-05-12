+!~-(function(PIXI, window, document, undefined) {
  var waterfallCanvas = function(c, cw, ch) {
    var _this = this;
    this.c = c;
    this.ctx = c.getContext('2d');
    this.cw = cw;
    this.ch = ch;
    this.particles = [];
    this.particleRate = 6;
    this.gravity = 0.15;
    this.init = function() {
      this.loop();
    };
    this.reset = function() {
      this.ctx.clearRect(0, 0, this.cw, this.ch);
      this.particles = [];
    };
    this.rand = function(rMi, rMa) {
      return ~~((Math.random() * (rMa - rMi + 1)) + rMi);
    };
    this.Particle = function() {
      var newWidth = _this.rand(1, 20);
      var newHeight = _this.rand(1, 45);
      this.x = _this.rand(10 + (newWidth / 2), _this.cw - 10 - (newWidth / 2));
      this.y = -newHeight;
      this.vx = 0;
      this.vy = 0;
      this.width = newWidth;
      this.height = newHeight;
      this.hue = _this.rand(200, 220);
      this.saturation = _this.rand(30, 60);
      this.lightness = _this.rand(30, 60);
    };
    this.Particle.prototype.update = function(i) {
      this.vx += this.vx;
      this.vy += _this.gravity;
      this.x += this.vx;
      this.y += this.vy;
    };
    this.Particle.prototype.render = function() {
      _this.ctx.strokeStyle = 'hsla(' + this.hue + ', ' + this.saturation + '%, ' + this.lightness + '%, .05)';
      _this.ctx.beginPath();
      _this.ctx.moveTo(this.x, this.y);
      _this.ctx.lineTo(this.x, this.y + this.height);
      _this.ctx.lineWidth = this.width / 2;
      _this.ctx.lineCap = 'round';
      _this.ctx.stroke();
    };
    this.Particle.prototype.renderBubble = function() {
      _this.ctx.fillStyle = 'hsla(' + this.hue + ', 40%, 40%, 1)';
      _this.ctx.fillStyle = 'hsla(' + this.hue + ', ' + this.saturation + '%, ' + this.lightness + '%, .3)';
      _this.ctx.beginPath();
      _this.ctx.arc(this.x + this.width / 2, _this.ch - 20 - _this.rand(0, 10), _this.rand(1, 8), 0, Math.PI * 2, false);
      _this.ctx.fill();
    };
    this.createParticles = function() {
      var i = this.particleRate;
      while (i--) {
        this.particles.push(new this.Particle());
      }
    };
    this.removeParticles = function() {
      var i = this.particleRate;
      while (i--) {
        var p = this.particles[i];
        if (p.y > _this.ch - 20 - p.height) {
          p.renderBubble();
          _this.particles.splice(i, 1);
        }
      }
    };
    this.updateParticles = function() {
      var i = this.particles.length;
      while (i--) {
        var p = this.particles[i];
        p.update(i);
      }
    };
    this.renderParticles = function() {
      var i = this.particles.length;
      while (i--) {
        var p = this.particles[i];
        p.render();
      }
    };
    this.clearCanvas = function() {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.fillStyle = 'rgba(255,255,255,.06)';
      this.ctx.fillRect(0, 0, this.cw, this.ch);
      this.ctx.globalCompositeOperation = 'lighter';
    };
    this.loop = function() {
      var loopIt = function() {
        requestAnimationFrame(loopIt, _this.c);
        _this.clearCanvas();
        _this.createParticles();
        _this.updateParticles();
        _this.renderParticles();
        _this.removeParticles();
      };
      loopIt();
    };
  };
  var isCanvasSupported = function() {
    var elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'));
  };
  var setupRAF = function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() {
          callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    }
    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
      };
    }
  };
  if (isCanvasSupported()) {
    var c = document.getElementById('waterfall');
    var cw = c.width = Math.max(document.getElementById('waterfall').scrollWidth, document.getElementById('waterfall').offsetWidth, document.getElementById('waterfall').clientWidth, document.getElementById('waterfall').scrollWidth, document.getElementById('waterfall').offsetWidth);
    var ch = c.height = Math.max(document.getElementById('waterfall').scrollHeight, document.getElementById('waterfall').offsetHeight, document.getElementById('waterfall').clientHeight, document.getElementById('waterfall').scrollHeight, document.getElementById('waterfall').offsetHeight);
    var waterfall = new waterfallCanvas(c, cw, ch);
    setupRAF();
    waterfall.init();
  } /* Second plugin */
  var w, h, renderer, stage, waveGraphics, partGraphics, waveTexture, partTexture, waveCount, partCount, waves, parts;

  function init() {
    renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight / 2, {
      backgroundColor: '0x' + tinycolor('hsl(200, 50%, 10%)').toHex()
    });
    stage = new PIXI.Container();
    waveCount = 2000;
    partCount = 1000;
    waves = [];
    parts = [];
    document.body.appendChild(renderer.view);
    reset();
    for (var i = 0; i < 300; i++) {
      step();
    }
    loop();
  }

  function reset() {
    w = window.innerWidth;
    h = window.innerHeight;
    renderer.resize(w, h);
    waveGraphics = null;
    waveTexture = null;
    partGraphics = null;
    partTexture = null;
    waveGraphics = new PIXI.Graphics();
    waveGraphics.cacheAsBitmap = true;
    waveGraphics.beginFill('0x' + tinycolor('hsl(200, 74%, 40%)').toHex(), 0.15);
    waveGraphics.drawCircle(0, 0, 20);
    waveGraphics.endFill();
    waveTexture = waveGraphics.generateTexture();
    partGraphics = new PIXI.Graphics();
    partGraphics.cacheAsBitmap = true;
    partGraphics.beginFill('0x' + tinycolor('hsl(200, 70%, 40%)').toHex(), 0.2);
    partGraphics.drawCircle(0, 0, 15);
    partGraphics.endFill();
    partTexture = partGraphics.generateTexture();
  }

  function step() {
    if (waves.length < waveCount) {
      for (var i = 0; i < 10; i++) {
        var wave = new PIXI.Sprite(waveTexture),
          scale = 0.2 + Math.random() * 0.8;
        wave.position.x = w / 2;
        wave.position.y = h / 2;
        wave.anchor.x = 0.5;
        wave.anchor.y = 0.5;
        wave.scale.x = scale * 10;
        wave.scale.y = scale * 0.5;
        wave.blendMode = PIXI.BLEND_MODES.SCREEN;
        waves.push({
          sprite: wave,
          x: wave.position.x,
          y: wave.position.y,
          vx: 0,
          vy: 0,
          angle: Math.PI / 2 + Math.random() * Math.PI + Math.PI * 1.5,
          speed: 0.01 + Math.random() / 10
        });
        stage.addChild(wave);
      }
    }
    for (var i = 0, length = waves.length; i < length; i++) {
      var wave = waves[i];
      wave.sprite.position.x = wave.x;
      wave.sprite.position.y = wave.y;
      wave.vx = Math.cos(wave.angle) * wave.speed;
      wave.vy = Math.sin(wave.angle) * wave.speed;
      wave.x += wave.vx;
      wave.y += wave.vy;
      wave.speed *= 1.01;
      if (wave.x > w + 200 || wave.x < -200 || wave.y > h + 200) {
        wave.x = w / 2;
        wave.y = h / 2;
        wave.speed = 0.01 + Math.random() / 10;
      }
    }
    if (parts.length < partCount) {
      var part = new PIXI.Sprite(partTexture),
        scale = 0.2 + Math.random() * 0.8,
        type = Math.random() > 0.5 ? 1 : 0;
      part.position.x = w / 2 + Math.random() * 380 - 190;
      part.position.y = h / 2 + 0;
      part.anchor.x = 0.5;
      part.anchor.y = 0.5;
      part.scale.x = type ? scale : scale * 0.5;
      part.scale.y = type ? scale : scale * 15;
      part.blendMode = PIXI.BLEND_MODES.SCREEN;
      parts.push({
        sprite: part,
        ox: part.position.x,
        oy: part.position.y,
        x: part.position.x,
        y: part.position.y,
        vx: 0,
        vy: 0,
        angle: (-Math.PI * 0.5) + (w / 2 - part.position.x) / 750,
        speed: 0.0001 + Math.random() / 50
      });
      stage.addChild(part);
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      var part = parts[i];
      part.sprite.position.x = part.x;
      part.sprite.position.y = part.y;
      part.vx = Math.cos(part.angle) * part.speed;
      part.vy = Math.sin(part.angle) * part.speed;
      part.x += part.vx;
      part.y += part.vy;
      part.speed *= 1.01;
      if (part.x > w + 50 || part.x < -50 || part.y < -50) {
        part.x = part.ox;
        part.y = part.oy;
        part.speed = 0.01 + Math.random() / 50;
      }
    }
    renderer.render(stage);
  }

  function loop() {
    step();
    requestAnimationFrame(loop);
  }
  window.addEventListener('resize', reset);
  init();
})(PIXI, this, document);