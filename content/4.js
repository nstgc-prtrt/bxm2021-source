function countdown_4() {
    const fin = new Date(2021, 7, 22, 0, 0, 0, 0);
    
    let now = new Date();
    let diff = fin-now;
    return `剩余${
        Math.floor(diff/(1000*60*60*24))
    }天${
        Math.floor(diff/(1000*60*60)) - Math.floor(diff/(1000*60*60*24))*24
    }小时${
        Math.floor(diff/(1000*60)) - Math.floor(diff/(1000*60*60))*60
    }分钟${
        Math.floor(diff/1000) - Math.floor(diff/(1000*60))*60
    }秒`;
}

function cvs_4() {
    // interp helpers
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

    const cvs = document.querySelector('#cvs-4');

    const ctd_text = document.querySelector("#countdown-4");

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, .1, 1000);

    const renderer = new THREE.WebGLRenderer({
        canvas: cvs,
        alpha: true,
        antialias: true
    });

    const camdist = 50;

    renderer.setPixelRatio(window.innerWidth / window.innerHeight);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2;
    renderer.outputEncoding = THREE.sRGBEncoding;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envMap = pmremGenerator.fromEquirectangular(preloaded_3d.hdri).texture;
    // scene.background = envMap;
    scene.environment = envMap;
	// texture.dispose();
	// pmremGenerator.dispose();

    preloaded_3d.hourglass.scene.scale.set(.5, .5, .5);
    preloaded_3d.hourglass.scene.position.y = -13.5;
    scene.add(preloaded_3d.hourglass.scene);
    
    const light = new THREE.PointLight(0xffffff, 1, 200);
    light.position.x = -20;
    light.position.z = -20;
    scene.add( light );

    function particle() {
        const geo = new THREE.SphereGeometry(.25, 24, 24);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF, 
        });
        const sph = new THREE.Mesh(geo, mat);

        const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));

        sph.position.set(x, y, z);
        scene.add(sph)
    }

    Array(200).fill().forEach(particle);

    let cam_angle = [0, 0];

    // mouse stuff
    const anim_dur = 500;

    let going_to = false;
    
    let curr_mousepos = [0, 0];

    let anim_init_angle = [undefined, undefined];

    let anim_beg_signal = false;
    let anim_completion_signal = false;
    let anim_dir = -1;

    cvs.addEventListener('mousemove', function(e) {
        curr_mousepos = [e.x, e.y];
    }, false);

    cvs.addEventListener('mouseenter', function(e) {
        going_to = true;
        anim_beg_signal = true;
        curr_mousepos = [e.x, e.y];
    });

    let tbeg;
    let tlast;
    let tcurr;

    let tanim;

    function update(tstamp) {

        if (anim_beg_signal) {
            if (going_to) {
                anim_init_angle = Array.from(cam_angle);
                let a = curr_mousepos[0]/parseInt(cvs.style.width, 10)*Math.PI*2;
                if (Math.abs(anim_init_angle[0] - a) > Math.PI) {
                    if (anim_init_angle[0] > a) {
                        anim_dir = 1;
                    }
                    else if (anim_init_angle[0] < a) {
                        anim_dir = 0;
                    }
                } 
                else {
                    anim_dir = (anim_init_angle[0] < a);
                }
            }
            tanim = tstamp;
            anim_beg_signal = false;
        }

        if (anim_completion_signal) {
            if (going_to) {
                going_to = false;
                anim_dir = -1;
            }

            tanim = undefined;
            anim_completion_signal = false;
        }

        if (going_to) {
            let a = curr_mousepos[0]/parseInt(cvs.style.width, 10)*Math.PI*2;
            if (anim_dir === 0) {
                if (a > cam_angle[0]) {
                    a -= Math.PI*2;
                }
            }
            else if (anim_dir === 1) {
                if (a < cam_angle[0]) {
                    a += Math.PI*2;
                }
            }

            cam_angle[0] = THREE.MathUtils.lerp(anim_init_angle[0], a, cubicBezier((tstamp - tanim) / anim_dur, [.3, 0], [.4, 1]));
            if ((tstamp - tanim) > anim_dur) {
                anim_completion_signal = true;
            }
        }

        if (!going_to) {
            cam_angle[0] = curr_mousepos[0]/parseInt(cvs.style.width, 10)*Math.PI*2;
        }
        cam_angle[1] = curr_mousepos[1]/parseInt(cvs.style.height, 10)*Math.PI*2;

        camera.position.x = camdist * Math.cos(cam_angle[0]);
        camera.position.z = camdist * Math.sin(cam_angle[0]);
        camera.rotation.y = -cam_angle[0]+Math.PI/2 - .2; 

        //camera.aspect = window.clientWidth / window.clientHeight;
        //camera.updateProjectionMatrix();
    }

    function animate(tstamp) {
        if (!tbeg)
            tbeg = tstamp;
        
        tcurr = tstamp - tbeg;

        update(tcurr);

        if (window.innerWidth !== cvs.width || window.innerHeight !== cvs.height) {
            renderer.setPixelRatio(window.innerWidth / window.innerHeight);
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }

        if (matchMedia('(pointer:fine)').matches) {
            renderer.render(scene, camera);
        }

        ctd_text.innerHTML = countdown_4();

        tlast = tcurr;
        if (curr_page === 4)
            requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}

// function bl_api_bg_4() {
//     const parent_el = document.querySelector("#vid-titles-4");
//     const req_url = 'https://api.allorigins.win/raw?url=' + encodeURIComponent("https://api.bilibili.com/x/web-interface/search/type?&page=1&order=pubdate&search_type=video&keyword=%E9%98%AE%E5%A4%A9%E6%AE%8A");
//     fetch(req_url)
//     .then(data => data.json())
//     .then(res => {
//         let i;
//         for (i = 0 ; i < 5 ; i++) {
//             const el = document.createElement("h1");
//             el.dataset.xoff="100";
//             el.dataset.yoff="0";
//             el.innerHTML = res.data.result[i].title.replace(/<[^>]*>?/gm, '') + "   --   " + res.data.result[i].author.replace(/<[^>]*>?/gm, '');
//             el.style.marginTop = `${i*3+10}em`;
//             el.style.marginLeft = `${Math.max(.2, Math.min(Math.random(), .8))*window.innerWidth}px`;
//             parent_el.appendChild(el);
//         }
//     });
// }

// bl_api_bg_4();

cvs_4();
