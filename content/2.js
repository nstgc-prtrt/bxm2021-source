function vid_display_2() {
    const title_el = document.querySelector("#vid-title-2");
    const auth_el = document.querySelector("#auth-title-2");
    const track_el = document.querySelector("#track-title-2");

    const tns = document.querySelectorAll("#tn-container a");
    Array.from(tns).forEach((el) => {
        el.addEventListener("mouseenter", function() {
            title_el.innerHTML = this.title;
            auth_el.innerHTML = this.dataset.author;
            track_el.innerHTML = this.dataset.track;
        });
        el.addEventListener("mouseleave", function() {
            title_el.innerHTML = "航海员的职责 ~ 制作规范";
            auth_el.innerHTML = "✖✖✖";
            track_el.innerHTML = "航海员的职责 ~ 制作规范";
        });
    });

}

function looper_2() {
    let el = document.querySelector("#looper-2");
    let l = 1;
    let f = () => {
        if (parseInt(el.style.top, 10) >= 0) {
            el.style.top = `${-(document.documentElement.clientHeight)}px`;
            l = (document.documentElement.clientHeight);
        }
        else {
            l -= 1;
            el.style.top = `-${l}px`;
        }		
        if (curr_page === 2)
            requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
}

function text_handler_2() {
    const radios = document.querySelectorAll('#text-2-radio-container input');
    const textsects = document.querySelectorAll('#text-2 p');
    Array.from(radios).forEach((el, i) => {
        el.addEventListener('change', function() {
            Array.from(textsects).forEach((pel) => {
                pel.classList.remove('visible-text-2');
            });
            textsects[i].classList.add('visible-text-2');
        }, false);
    });
}

text_handler_2();

looper_2();

vid_display_2();
