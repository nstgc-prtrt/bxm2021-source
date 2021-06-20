function randomize_boat_1() {
    const boat_el = document.querySelector('#boat-1');
    boat_el.setAttribute('src', `assets/boats/${
        Math.floor(Math.random() * 5 + 1)
    }.png`)
}

function bulb_1() {
    const bulb_el = document.querySelector('#bulb-1');
    bulb_el.addEventListener('click', function() {
        message(`
            给不知道如何开始选曲的兄贵们的一点小启发：
            <br/>
            <a href="https://www.bilibili.com/video/BV1z54y1Y72p" target="_blank" rel="noopener noreferrer">OTOMAD TRIBUTE Original Soundtrack</a>
            <br/>
            <a href="https://www.bilibili.com/video/BV1DW411u7rR" target="_blank" rel="noopener noreferrer">otoMAD-synthesis.mid</a>
            <br/>
            <a href="https://www.bilibili.com/video/BV1ps411R7BZ" target="_blank" rel="noopener noreferrer">Remake of Medley of YTPMV</a>
            <br/>
            <a href="https://www.bilibili.com/video/BV1ks411Q7Lr" target="_blank" rel="noopener noreferrer">A-Side of YTPMV</a>
            <br/>
            <a href="https://www.bilibili.com/video/BV1Dx411F7gt" target="_blank" rel="noopener noreferrer">C-Side of YTPMV</a>
            <br/>
            <a href="https://www.bilibili.com/video/BV1Uf4y1q7gg" target="_blank" rel="noopener noreferrer">D-Side of YTPMV</a>
            <br/>
            <a href="https://www.bilibili.com/video/BV1Lp411Z75h" target="_blank" rel="noopener noreferrer">E-Side of YTPMV</a>
            <br/>
            <a href="https://www.bilibili.com/video/BV1bJ411M728" target="_blank" rel="noopener noreferrer">F-Side of YTPMV</a>
        `);
    }, false);
}

bulb_1()
randomize_boat_1();