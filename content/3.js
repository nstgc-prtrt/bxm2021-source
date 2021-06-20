function judge_handler_3() {
    const avis = document.querySelectorAll('#avatars-3 > a > img');
    const texts = document.querySelectorAll('#text-judge-3 > p');

    let active = false;
    let active_i = -1;
    
    function showtext() {

    }
    
    Array.from(avis).forEach((el, i) => {
        el.addEventListener('mouseenter', function() {       
            active_i = i;
            active = true;
            document.querySelector('#avatars-3').classList.add('active-3');
            document.querySelector('#text-judge-3').classList.add('active-3');

            // Array.from(avis).forEach(eli => eli.classList.remove('current-avi-3'));
            el.classList.add('current-avi-3');
        
            // Array.from(texts).forEach(elp => elp.classList.remove('current-desc-3'));
            texts[i].classList.add('current-desc-3');
            this.setAttribute('src', "assets/" + this.dataset.filename + "_a.png");
        });
        el.addEventListener('mouseleave', function() {
            active = false;
            active_i = -1;
            Array.from(avis).forEach(eli => eli.classList.remove('current-avi-3'));
            Array.from(texts).forEach(elp => elp.classList.remove('current-desc-3'));
            document.querySelector('#avatars-3').classList.remove('active-3');
            document.querySelector('#text-judge-3').classList.remove('active-3');
            this.setAttribute('src', "assets/" + this.dataset.filename + ".png");
        });
    });
}
judge_handler_3();
