let inplay = false
let loaded = false

let images = {}
let actors = {}

async function init() {
    await setup_canvas()

    const result = await Promise.allSettled([
        //load_image(canvas.toDataURL()),
        load_image('images/background.jpg'),
        load_image('images/bread.png'),
        load_image('images/brick.jpg'),
    ])

    result.forEach((img) => {
        if (!img.value) {
            c.clearRect(0, 0, canvas.width, canvas.height)
            c.fillStyle = '#fff'
            let text = 'Error: Missing images.'
            let text_width = c.measureText(text).width
            c.fillText(text, center - text_width / 2, middle)
            return loaded = false
        }

        let src = img.value.src
        let name = src.slice(src.lastIndexOf('/') + 1, src.lastIndexOf('.'))
        images[name] = img.value
        loaded = true
    });

    if (!loaded) return

    // TODO: initiate actors for game play
    actors['bkgds'] = [
        new Background(0, {image: images.background}),
        new Background(1, {image: images.background}) ]

    actors['p_sets'] = [
        new Platform_Set({instruc: 'ssbs'}) ]

    actors['player'] = new Player({
        x: 100,
        y: actors.p_sets[0].platforms[0].y - images.bread.height,
        image: images.bread })


    inplay = true
    animate()
}

function animate() {
    inplay = false
    
    c.clearRect(0, 0, canvas.width, canvas.height)

    // TODO: animate like ya obvi

    console.log('animate');

    Object.entries(actors).forEach(([_, value]) => {
        if (Array.isArray(value)) {
            value.forEach(el => el.update())
            return
        }
        value.update()
    })


    if (inplay && loaded) requestAnimationFrame(animate)
}

let is_key_down = {
    left: false,
    up: false,
    right: false,
    down: false,
}

window.onkeydown = function(e) {
    let k = e.keyCode - 37
    if (k >= 0 && k < 4) {
        is_key_down[Object.keys(is_key_down)[k]] = true
    }
}

window.onkeyup = function(e) {
    let k = e.keyCode - 37
    if (k >= 0 && k < 4) {
        is_key_down[Object.keys(is_key_down)[k]] = false
    }
}

window.onload = init()
