let inplay = true

function init() {
    setup_canvas()

    // TODO: initiate actors for game play

    requestAnimationFrame(animate)
}

function animate() {
    if (inplay) requestAnimationFrame(animate)

    // TODO: animate like ya obvi

    inplay = false
}

document.onload = init()
