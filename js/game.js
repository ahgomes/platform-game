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
    actors['background'] = [
        new Background(0, {image: images.background}),
        new Background(1, {image: images.background})]

    inplay = true
    animate()
}

function animate() {
    inplay = false

    // TODO: animate like ya obvi

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
