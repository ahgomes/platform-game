let inplay = false
let loaded = false

let images = {}
let actors = {}

async function init() {
    await setup_canvas()

    const result = await Promise.allSettled([
        //load_image(canvas.toDataURL()),
        load_image('images/background.jpg'),
        load_image('images/brick.jpg'),
        load_image('images/bread.png'),
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
    actors['backgrounds'] = [
        new Background(0, {image: images.background}),
        new Background(1, {image: images.background}) ]

    actors['platforms'] = [
        new Actor({
            x: 0,
            width: 500, height: 80,
            image: images.brick
        })]

    actors['player'] = new Player({
        x: 100,
        y: actors.platforms[0].y - (images.bread.height / 2) + 2,
        image: images.bread })


    inplay = true
    animate()
}

function animate() {
    inplay = false

    // TODO: animate like ya obvi

    console.log(animate);

    Object.entries(actors).forEach(([_, value]) => {
        if (Array.isArray(value)) {
            value.forEach(el => el.update())
            return
        }
        value.update()
    })


    if (inplay && loaded) requestAnimationFrame(animate)
}

document.onload = init()
