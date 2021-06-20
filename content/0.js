function countdown_handler() {
    let text = document.querySelector("#countdown");
    let fin = new Date(2021, 5, 18);
    let now = new Date();
    if (fin - now > 0) {
        text.innerHTML = `${Math.ceil((fin-now)/(1000*60*60*24))}`;
    }
    else {
        text.innerHTML = '';
        text.nextElementSibling.innerHTML = '';
        text.previousElementSibling.innerHTML = '揭晓藏宝图的时间到了！快进入详情页面看看吧！';
    }

    if (is_secret)
    {
        document.querySelector("#scroll-anim").onclick = function() {
            this.style.animation = "none";
            this.style.pointerEvents = "none";
            let d = 300;
            setTimeout(() => {
                document.querySelector("#scroll-anim").src = "assets/Map_anim_2.png";
				setTimeout(() => {
					document.querySelector("#scroll-anim").src = "assets/Map_anim_3.png";
					setTimeout(() => {
						document.querySelector("#scroll-anim").src = "assets/Map_anim_4.png";
						setTimeout(() => {
                            let p = message("藏宝图揭幕的时候到了！<br>慷慨的海员在神秘的海域找到了崭新的东西<br>于是...<br>游离于远海的新航线现在开放给了所有人！<br>欢迎各位勇敢的冒险者！" + (matchMedia('(pointer:fine)').matches ? '' : '<br><br>使用桌面端获得最佳体验哦！'));
                            p.then(() => {
							    load_page(1);
                            });
						}, d);
					}, d);							
				}, d);
			}, d);
			
        };
    }
    else {
        document.querySelector("#scroll-anim").onclick = () => {
            message("请等待18号再来～").then(() => {});
        };
    }
}

function looper() {
    let el = document.querySelector("#looper");
    let l = 0;
    let f = () => {
        if (parseInt(el.style.left, 10) <= -(document.documentElement.clientWidth)+1) {
            el.style.left = "0px";
            l = 0;
        }
        else {
            l += 1;
            el.style.left = `-${l}px`;
        }		
        requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
    
}

looper();

countdown_handler();
