const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

let default_image
let middle

function setup_canvas() {
    const margin = 20
    const border = {width: 20, type: "solid", color: "#2d2d2d"}

    canvas.height = window.innerHeight - (margin * 2) - (border.width * 2)
    canvas.width = canvas.height * (4 / 3)
    center = canvas.width / 2
    middle = canvas.height / 2

    canvas.style.background = '#000'
    canvas.style.margin = `${margin}px auto`
    canvas.style.border = `${border.width}px ${border.type} ${border.color}`

    c.font='1em Courier New'
    c.fillStyle = '#000'
    c.fillRect(0, 0, canvas.width, canvas.height)
}

function load_image(url) {
    let img = new Image()
    return new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    })
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}
