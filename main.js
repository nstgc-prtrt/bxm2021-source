let curr_page = 0;
let load_lock = false;

let preloaded_imgs = [];

let THREE;
let GLTFLoader;
let RGBELoader;

let preloaded_3d = {};

let timeout_cancel_on_page_load;

const is_secret = (window.location.pathname === "/bxm2021/secret.html") || (new Date(2021, 5, 18) - new Date() < 0);

function preloadImage(url)
{
	return new Promise (r => {
    	const img = new Image();
    	img.src=url;
		preloaded_imgs.push(img);
		img.onload = r;
		img.onerror = r;
	});
}

function kill_img_dragging() {
	let d = document.querySelectorAll("img");
	Array.from(d).forEach((e) => {e.ondragstart = function() {return false;}});
}

function floater_init() {
	// cubic bezier impl
	function lerp(x, min, max) {
		return min + x * (max - min);
	}

	function cubic_cf(t, A, B, C, D) {
		return A*(t*t*t) + B*(t*t) + C*t + D;
	}

	function slopeFromT(t, A, B, C){
		return 1/(3*A*t*t + 2*B*t + C);
	}

	function cubicBezier(x, p1, p2){
		const p0 = [0, 0];
		const p3 = [1, 1];

		let A = p3[0] - 3*p2[0] + 3*p1[0] - p0[0];
		let B = 3*p2[0] - 6*p1[0] + 3*p0[0]; 
		let C = 3*p1[0] - 3*p0[0];
		let D = p0[0];

		let E = p3[1] - 3*p2[1] + 3*p1[1] - p0[1];
		let F = 3*p2[1] - 6*p1[1] + 3*p0[1]; 
		let G = 3*p1[1] - 3*p0[1];
		let H = p0[1];

		let currentT = x;
		const nRefinementIterations = 5;
		
		let i;
		for (i=0; i < nRefinementIterations; i++) {
			let currentX = cubic_cf(currentT, A, B, C, D);
			let currentSlope = slopeFromT(currentT, A, B, C);
			currentT -= (currentX - x)*(currentSlope);
			if (currentT < 0)
				currentT = 0;
			else if (currentT > 1)
				currentT = 1;
		}

		return cubic_cf(currentT, E, F, G, H);
	}

	function floater() {
		const floaters = document.querySelectorAll('.floater');

		if (matchMedia('(pointer:fine)').matches) {
			let going_back = false;
			let going_to = false;
			
			let curr_mousepos;
	
			window.onmousemove = function(e) {
				curr_mousepos = [e.x/document.documentElement.clientWidth, e.y/document.documentElement.clientHeight*2-1];
				if(!going_to)
				{
					Array.from(floaters).forEach((elp) => {
						Array.from(elp.children).forEach((el) => {
							el.style.left = Math.floor(curr_mousepos[0] * el.dataset.xoff) + "px";
							el.style.top = Math.floor(curr_mousepos[1] * el.dataset.yoff) + "px";
						});
					});
				}
			};
			
			document.body.onmouseleave = function() {
				const anim_dur = 500;

				going_back = true;
				
				let initial_pos = Array.from(floaters).map((elp) => {
					return Array.from(elp.children).map((el) => {
						return [el.style.left, el.style.top].map((s) => parseInt(s, 10));
					});
				});
				
				const final_pos = [0, 0];
				
				let tbeg;

				let tlast = 0;
	
				function f(tstamp) {
					if (!tbeg)
						tbeg = tstamp;

					let fac = cubicBezier(tlast / anim_dur, [.25, .1], [.25, 1]); // emulating default css ease

					Array.from(floaters).forEach((elp, ip) => {
						Array.from(elp.children).forEach((el, i) => {
							el.style.left = Math.floor(lerp(fac, initial_pos[ip][i][0], final_pos[0])) + "px";
							el.style.top = Math.floor(lerp(fac, initial_pos[ip][i][1], final_pos[1])) + "px";
						});
					});
	
					tlast = tstamp - tbeg;
					if (tlast < anim_dur && going_back)
						requestAnimationFrame(f);
					else
						going_back = false;
				}
				requestAnimationFrame(f);
			};

			document.body.onmouseenter = function(e) {
				going_back = false;
				going_to = true;
				const anim_dur = 200;
			
				curr_mousepos = [e.x/document.documentElement.clientWidth, e.y/document.documentElement.clientHeight*2-1];

				//let initial_pos = [0, 0];
				let initial_pos = Array.from(floaters).map((elp) => {
					return Array.from(elp.children).map((el) => {
						return [el.style.left, el.style.top].map((s) => parseInt(s, 10));
					});
				});

				let tbeg;

				let tlast = 0;
	
				function f(tstamp) {
					if (!tbeg)
						tbeg = tstamp;

					let fac = cubicBezier(tlast / anim_dur, [.25, .1], [.25, 1]); // emulating default css ease

					Array.from(floaters).forEach((elp, ip) => {
						Array.from(elp.children).forEach((el, i) => {
							el.style.left = Math.floor(lerp(fac, initial_pos[ip][i][0], curr_mousepos[0] * el.dataset.xoff)) + "px";
							el.style.top = Math.floor(lerp(fac, initial_pos[ip][i][1], curr_mousepos[1] * el.dataset.yoff)) + "px";
						});
					});
	
					tlast = tstamp - tbeg;
					if (tlast < anim_dur && going_to)
						requestAnimationFrame(f);
					else
						going_to = false;
				}
				requestAnimationFrame(f);
			};
		}
		else {
			window.ondeviceorientation = function(e) {
				let pos = [Math.max(-90, Math.min(90, e.gamma))/90, e.beta/90];
				Array.from(floaters).forEach((elp) => {
					Array.from(elp.children).forEach((el) => {
						el.style.left = Math.floor(pos[0] * el.dataset.xoff) + "px";
						el.style.top = Math.floor(pos[1] * el.dataset.yoff) + "px";
					});
				});
			};
		}
	}
	floater();
}

function loader() {		
	// its all my fault, https redirect
	if (location.protocol !== 'https:') {
		location.replace(`https:${location.href.substring(location.protocol.length)}`);
	}

	// init msg box
	const msg_btn = document.querySelector('#message-box > div > button');  
	msg_btn.addEventListener('click', function()  {
		document.querySelector('#message-box').classList.remove('msg-visible');
		setTimeout(() => {
			document.querySelector('#message-box > div > h1').innerHTML = "";
		}, 100);
	}, false);

	// init nav bar
	Array.from(document.querySelector("#nav-container").children).forEach((el, i) => {
		el.addEventListener('click', function() {
			load_page(i).catch((e) => alert("Something went wrong! " + e));
		}, false);
	});

	function audio() {
		const url = "assets/vrc6n001.ogg";
		const context = new AudioContext();
		const source = context.createBufferSource();
		source.connect(context.destination);
	
		const promise = fetch(url).then(r => r.arrayBuffer()).then(buffer => {
			context.decodeAudioData(buffer, (r) => {
				source.buffer = r;
	
				source.loop = true;
			}, () => {alert("Error fetching audio!");});
		}).catch((e) => {alert(e);});
		
		const audio_btn = document.querySelector("#audio-btn");
	
		let started = false;
	
		audio_btn.addEventListener("click", function() {
			if (!started) {
				source.start();
				started = true;
				this.src = "assets//audio_btn.svg";
			}
			else if (context.state === 'running') {
				context.suspend().then(function() {
					audio_btn.src = "assets//audio_btn_muted.svg";
				});
			}
			else if (context.state === 'suspended') {
				context.resume().then(function() {
					audio_btn.src = "assets//audio_btn.svg";
				});
			}
		}, false);
	
		return promise;
	}

	const preload = [
		'assets/BXM.png',
		'assets/Map_anim_2.png',
		'assets/Map_anim_3.png',
		'assets/Map_anim_4.png',
		'assets/qie_a.png',
		'assets/cirnoire_a.png',
		'assets/huangbo_a.png',
		'assets/p2-tn1.jpg',
		'assets/p2-tn2.jpg',
		'assets/p2-tn3.jpg',
		'assets/p2-tn4.jpg',
		'assets/p2-tn5.jpg',
		'assets/cirnoire.png',
		'assets/qie.png',
		'assets/huangbo.png',
		'assets/audio_btn.svg',
		'assets/boats/1.png',
		'assets/boats/2.png',
		'assets/boats/3.png',
		'assets/boats/4.png',
		'assets/boats/5.png',
		'assets/boats/6.png',
		'assets/chara_key_2.png',
		'assets/crab_5.png',
		'assets/dissolve_noise.png'
				];
	
	function three_await_loader(loader, url) {
		return new Promise((resolve, reject) => {
			loader.load(url, data => resolve(data), null, reject);
		});
	}

	const progress_el = document.querySelector('#loading #progress-bar > div')

	
	document.addEventListener('DOMContentLoaded', async () => {
		let tasks = [];
		let tasks_done = 0;

		function increment_progress_bar() {
			tasks_done++;
			progress_el.style.width = `${Math.floor((tasks_done / (tasks.length)) * 100)}%`;;
		}

		console.log('Loading Fonts...');
		tasks.push(document.fonts.ready.then(() => {
			console.log('Loading Fonts... Done');
			increment_progress_bar(tasks, tasks_done);
		}));

		console.log('Loading Audio...');
		tasks.push(audio().then(() => {
			console.log('Loading Audio... Done');
			increment_progress_bar(tasks, tasks_done);
		}));

		if (is_secret) {
			console.log('Loading Image Assets...');
			tasks.push(Promise.all(preload.map(x => 
					window.location.href.substring(0, window.location.href.lastIndexOf("/")+1) + x
				).map(x => preloadImage(x))).then(() => {
				console.log('Loading Image Assets... Done');
				increment_progress_bar(tasks, tasks_done);
			}));

			let three_loaders_ready;

			if (matchMedia('(pointer:fine)').matches) {
				console.log('Loading Three...');
				tasks.push(new Promise(async resolve => {
					THREE = await import('https://cdn.skypack.dev/three@0.129.0');
					[{GLTFLoader}, {RGBELoader}] = await Promise.all([
						import('https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js'),
						import('https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/RGBELoader.js')
					]);
					three_loaders_ready();
					console.log('Loading Three... Done');
					increment_progress_bar(tasks, tasks_done);
					resolve();
				}));

				tasks.push(new Promise(async resolve => {
					await new Promise(r => {
						three_loaders_ready = r;
					});
					console.log('Loading 3D Assets...');
					[preloaded_3d.hourglass, preloaded_3d.hdri] = await Promise.all([
						three_await_loader(new GLTFLoader(), 'assets/hourglass/scene.gltf'),
						three_await_loader(new RGBELoader().setDataType( THREE.UnsignedByteType ), 'assets/lakeside_1k.hdr')
					]);
					console.log('Loading 3D Assets... Done');
					increment_progress_bar(tasks, tasks_done);
					resolve();
				}));
			}
		}

		await Promise.all(tasks);

		document.body.classList.remove("unloaded");
	}, false)

	floater_init();

    kill_img_dragging();

	console.log([
 		'        _______  _______  _     _   ______  __   __  _______  _______  |      ',
 		'|       |_____|  |        |_____|  |_____/    \\_/    |  |  |  |_____|  |      ',
 		'|_____  |     |  |_____   |     |  |    \\_     |     |  |  |  |     |  |______',
		'■■■■   ■  ■■ ■    ■■  ■■■■■■■■   ■    ■■   ■■   ■■■■     ■■■    ■■   ■■■    ■■ ',
		'■   ■  ■  ■  ■■   ■■    ■   ■    ■■   ■■   ■■   ■   ■       ■  ■  ■     ■   ■■ ',
		'■   ■   ■■   ■■  ■■■  ■■■■■■■■■  ■■  ■■■   ■ ■  ■   ■■      ■  ■  ■     ■    ■ ',
		'■■■■    ■■   ■ ■ ■ ■   ■■■■■■    ■ ■ ■ ■  ■■ ■  ■    ■      ■ ■■  ■     ■    ■ ',
		'■   ■   ■■   ■ ■ ■ ■   ■     ■   ■ ■ ■ ■  ■  ■  ■    ■     ■   ■  ■    ■     ■ ',
		'■   ■■ ■■■■  ■ ■■  ■   ■■■■■■■   ■ ■■  ■  ■■■■■ ■   ■■    ■■   ■  ■   ■■     ■ ',
		'■   ■  ■  ■  ■  ■  ■   ■     ■   ■  ■  ■ ■■   ■ ■   ■    ■■    ■  ■  ■■      ■ ',
		'■■■■■ ■■   ■ ■     ■   ■■■■■■■   ■     ■ ■    ■ ■■■■     ■■■■   ■■   ■■■■  ■■■■'
	].join('\n'));
}

function message(msg) {
	const msg_container = document.querySelector("#message-box");
	document.querySelector("#message-box > div > h1").innerHTML = msg;
	msg_container.classList.add('msg-visible');
	let p = new Promise((resolve) => {
		document.querySelector('#message-box > div > button').addEventListener('click', function()  {
			resolve();
		}, { capture: false, once: true});
	});
	return p;
}

async function load_page(id) {
	if (load_lock) {
		return;
	}

	if (id === curr_page) {
		alert("Invalid request!");
		return;
	}

	if (timeout_cancel_on_page_load) {
		clearTimeout(timeout_cancel_on_page_load);
		timeout_cancel_on_page_load = undefined;
	}

	const transition_delay = 500; //check css for this val
		
	document.body.classList.add("navbar");

	const nav_container = document.querySelector('#nav-container');
	nav_container.style.pointerEvents = "none"; // lock nav
	load_lock = true;

	const html = await (await fetch(`content/${id}.xml`)).text();

	// get rid of old script tag, this has absolutely zero effect
	const old_script = document.querySelector('#content-js');
	old_script.parentNode.removeChild(old_script);
	

	// load css
	const new_css = document.createElement('link');
	await new Promise((resolve) => {
		document.head.appendChild(new_css);
		new_css.rel = 'stylesheet';
		new_css.id = 'new-css';
		new_css.setAttribute('href', `content/${id}.css`);
		new_css.onload = resolve;
	});


	// load html, cant figure out how to await this
	const old_page = document.querySelector("#old-page");
	const new_page = document.createElement('div');
	old_page.parentNode.insertBefore(new_page, old_page);
	new_page.id = 'new-page';
	new_page.innerHTML = html;

	// load js
	const new_script = document.createElement('script');
	await new Promise((resolve) => {
		document.body.appendChild(new_script);
		new_script.id = 'content-js';
		new_script.setAttribute('src', `content/${id}.js`);
		new_script.onload = resolve;
	});
	
	if (id > curr_page) 
		document.body.classList.add('scroll-up');
	else if (id < curr_page) 
		document.body.classList.add('scroll-down');

	setTimeout(() => {
		old_page.parentNode.removeChild(old_page);
		document.body.classList.remove('scroll-up');
		document.body.classList.remove('scroll-down');
		new_page.id = 'old-page';
		const old_css = document.querySelector('#old-css');	
		old_css.parentNode.removeChild(old_css);
		new_css.id = 'old-css';
		nav_container.style.pointerEvents = "unset"; // unlock nav
		load_lock = false;
	}, transition_delay);
	

	kill_img_dragging();
	floater_init();

	curr_page = id;
	
	if (id === 0) {
		document.body.classList.remove("navbar");
	}
	
	Array.from(nav_container.children).forEach((el) => {el.classList.remove("current-page");});
	if (id < nav_container.children.length)
		nav_container.children[id].classList.add("current-page");
}

loader();

