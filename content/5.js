function p_5() {
    const key = sessionStorage.key('retro_voyage_p5');
    

    let revved;
    if (!key) {
        revved = false;
        timeout_cancel_on_page_load = setTimeout(() => {
            if (curr_page === 5) {
                sessionStorage.setItem('retro_voyage_p5', 1);
                document.querySelector('#info-5').classList.add('reveal-5');
                document.querySelector('#bg-5').style.top = "-100%";
                document.querySelector('#bg-radial-5').style.opacity = '0';
                revved = true;
            }
        }, 8000);
    }
    else {
        document.querySelector('#bg-radial-5').style.display = "none";
        document.querySelector('#info-5').classList.add('reveal-5');
        document.querySelector('#bg-5').style.top = "-100%";
        revved = true;
    }

}

p_5();
