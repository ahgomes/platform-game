const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

function setup_canvas() {
    let margin = 20
    let border = {width: 20, type: "solid", color: "#2d2d2d"}

    canvas.height = window.innerHeight - (margin * 2) - (border.width * 2)
    canvas.width = canvas.height * (4 / 3)

    canvas.style.background = '#000'
    canvas.style.margin = `${margin}px auto`
    canvas.style.border = `${border.width}px ${border.type} ${border.color}`
}

function image(src) {
    let img = new Image()
    img.src = src
    return img
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}
