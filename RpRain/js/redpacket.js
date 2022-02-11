function randomNum(minNum, maxNum) {
	switch (arguments.length) {
		case 1:
			return parseInt(Math.random() * minNum + 1, 10);
			break;
		case 2:
			return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
			break;
		default:
			return 0;
			break;
	}
}
var transitions = {
	// 兼容IE
	'transition': 'transitionend',
	// 兼容Opera
	'OTransition': 'oTransitionEnd',
	// 兼容Firefox
	'MozTransition': 'transitionend',
	// 兼容Google
	'WebkitTransition': 'webkitTransitionEnd'
};

function whichTransitionEvent() {
	var t,
		el = document.createElement('surface'),
		transitions = {
			'transition': 'transitionend',
			'OTransition': 'oTransitionEnd',
			'MozTransition': 'transitionend',
			'WebkitTransition': 'webkitTransitionEnd'
		}

	for (t in transitions) {
		if (el.style[t] !== undefined) {
			return transitions[t];
		}
	}
}
function fadeout(ele, opacity, speed) {
    if (ele) {
        var v = ele.style.filter.replace("alpha(opacity=", "").replace(")", "") || ele.style.opacity || 100;
        v < 1 && (v = v * 100);
        var count = speed / 1000;
        var avg = (100 - opacity) / count;
        var timer = null;
        timer = setInterval(function() {
            if (v - avg > opacity) {
                v -= avg;
                setOpacity(ele, v);
            } else {
                clearInterval(timer);
            }
        }, 500);
    }
}
function getkeyframes(name) {
	var animation = {};
	// 获取所有的style
	var ss = document.styleSheets;
	for (var i = 0; i < ss.length; ++i) {
		const item = ss[i];
		if (item.cssRules[0] && item.cssRules[0].name && item.cssRules[0].name === name) {
			animation.cssRule = item.cssRules[0];
			animation.styleSheet = ss[i];
			animation.index = 0;
		}
	}
	return animation;
}

function daojishi() {
	const daojishi_box = document.createElement('div');
	daojishi_box.setAttribute("class", `daojishi`)
	document.getElementById('rp_mask').appendChild(daojishi_box)
	daojishi_box.innerHTML =
		`
		<img src='http://cdn.onweixin.cn/Frw52DGfHl57kHnzUUQfhNgPauR3' style='width:80vw'>
		<div id='time_img'>
		</div>
	`
	var time = 3
	return new Promise((resolve, reject) => {
		var timer = setInterval(() => {
			if (time > 0) {
				var now_key = 'time' + time;
				var now_img = rp.config[now_key]
				document.getElementById('time_img').innerHTML = `<img src='${now_img}' />`
			}
			time--;
			if (time == -1) {
				window.clearInterval(timer)
				daojishi_box.remove()
				resolve('start')
			}
		}, 1500)
	})
}
var rp = {
	config: {
		rp_pic: `<img class='rp_hongbao' src='http://cdn.onweixin.cn/FuYXrrhJqpSqKFjpco-56BeiQrzG'>`,
		angle: 15,
		transitions: '',
		counter: 0,
		speed: '5',
		CreateRP_one_sec: 5,
		time1: 'http://cdn.onweixin.cn/FsO0qSb8i1SEcXLE4wy2zlqrZGaT?imageView2/2/w/150',
		time2: 'http://cdn.onweixin.cn/FgXyZF7XniT6CkShGyY2C9F8m1OK?imageView2/2/w/150',
		time3: 'http://cdn.onweixin.cn/Fpuj4rJ-GirlrKW4COlroyfS3WA1?imageView2/2/w/150',
		rp_select_num: 10,
		rp_select_count: 0,
	},
	rp_timer: {},
	CreateRP: () => {
		var new_rp = document.createElement("div");
		new_rp.innerHTML = rp.config.rp_pic
		var left = randomNum(10, 150)

		//创建动画
		var end_top = `${(left+20)/0.268}vw`
		var end_left = `-${left+20}vw`
		var time = (left + 20) / rp.config.speed
		new_rp.style.cssText =
			`transform: rotate(${rp.config.angle}deg);position: absolute;top: 0;left:${left}vw;animation:rp_run${rp.config.counter} ${time}s;"`;

		const runkeyframes =
			` @keyframes rp_run${rp.config.counter}{
		    0%{
		        left: ${left}vw;
		        top: -20vw;
		    }
		    100%{
		        left: ${end_left};
		        top: ${end_top};
		    }
		}`
		// 创建style标签
		const style = document.createElement('style');
		var css_name = `css_rp_${rp.config.counter}`
		var rp_keyframes = `rp_run${rp.config.counter}`
		style.setAttribute("id", `css_rp_${rp.config.counter}`)
		// 设置style属性
		style.type = 'text/css';
		// 将 keyframes样式写入style内
		style.innerHTML = runkeyframes;
		// 将style样式存放到head标签
		document.getElementsByTagName('head')[0].appendChild(style);
		new_rp.setAttribute("class", `rp_item`)
		document.getElementById('rp_mask').appendChild(new_rp)
		rp.config.counter++
		new_rp.addEventListener("animationend", function() {
			new_rp.remove()
			document.getElementById(css_name).remove()
			const Keyframes = getkeyframes(rp_keyframes);
			if (Keyframes && Keyframes.index) {
				Keyframes.styleSheet.deleteRule(Keyframes.index);
			}
		});
		new_rp.addEventListener('click',function(){
			if(rp.config.rp_select_count>=rp.config.rp_select_num){
				return false
			}
			rp.config.rp_select_count++;
			new_rp.remove()
			document.getElementById('rp_counter').innerText=`${rp.config.rp_select_count}/${rp.config.rp_select_num}`
			if(rp.config.rp_select_count>=rp.config.rp_select_num){
				rp.rp_end()
			}
		})
	},
	start: () => {
		//创建style
		var style = document.createElement('style');
		style.type = 'text/css';
		style.innerHTML =
			`
		.rp_hongbao{ width:15vw } 
		.daojishi{ 
			position: fixed;font-size: 45vw;transform: translate(-50%,-50%);
			left: 50%;top: 50%;font-weight: bold;
			animation-iteration-count: infinite;
		}
		@keyframes backInDown {
		  0% {
		    transform: translate(-50%,-300%) scale(0.1);
		    opacity: 1;
		  }
		
		  30% {
		    transform: translate(-50%,-30%) scale(1.3);
		    opacity: 1;
		  }
		
		  100% {
		    transform: translate(-50%,-50%) scale(1.6);
		    opacity: 1;
		  }
		}
		#time_img{
			width:50vw;
			height:10vw;
			position: absolute;
			top: 55%;
			left: 50%;
			transform: translate(-50%,-50%);
			text-align:center
		}
		#time_img img{
			    position: absolute;
			    left: 50%;
			    top: 50%;
			    transform: translate(-50%,-50%) scale(1.6);
				animation-name: backInDown;
				animation-duration: 1.5s;
				animation-fill-mode: both;
		}
		#rp_counter{
			    position: absolute;
			    bottom: 5vw;
			    color: white;
			    text-align: center;
				left:50%;
				transform: translateX(-50%);
				font-size:10vw
		}
		`;
		document.getElementsByTagName('head').item(0).appendChild(style);
		rp.config.transitions = whichTransitionEvent()

		var mask = document.createElement("div");
		mask.setAttribute("id", 'rp_mask')
		mask.setAttribute("style",
			"width:100vw;height:100vh;background:url('http://cdn.onweixin.cn/Fou7U51tVI1bVHhN5h-TCesYkY1Y');background-size:contain;position: fixed;top: 0;left:0"
		);
		document.body.appendChild(mask)

		var counter = document.createElement("p");
		counter.setAttribute("id", 'rp_counter')
		mask.appendChild(counter)
		
		//倒计时
		daojishi().then(res => {
			rp.rp_timer = setInterval(() => {
				for (let i = 0; i < rp.config.CreateRP_one_sec; i++) {
					rp.CreateRP()
				}
			}, 1000)
		})
	},
	rp_end:()=>{
		window.clearInterval(rp.rp_timer)
		console.log(rp.callback)
		rp.callback()
	},
	callback:()=>{
		
	}
}
