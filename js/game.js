let inplay = false
let loaded = false

async function init() {
    await setup_canvas()

    const result = await Promise.allSettled([
        load_image(canvas.toDataURL()),
        //load_image('background.jpg'),
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
        c.drawImage(img.value, 0, 0);
        loaded = true
    });

    if (!loaded) return

    // TODO: initiate actors for game play

    inplay = true
    animate()
}

function animate() {
    inplay = false

    // TODO: animate like ya obvi
    console.log('animate')


    if (inplay && loaded) requestAnimationFrame(animate)
}

document.onload = init()
