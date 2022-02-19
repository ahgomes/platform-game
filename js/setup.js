const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

let center, middle
let press_start
let images = {}

async function setup_canvas() {
    const margin = 50
    const border = {width: 50, type: "solid", color: "#2d2d2d"}

    canvas.height = window.innerHeight - (margin * 2) - (border.width * 2)
    canvas.width = canvas.height * (4 / 3)
    center = canvas.width / 2
    middle = canvas.height / 2

    canvas.style.background = '#000'
    canvas.style.margin = `${margin}px auto`
    canvas.style.border = `${border.width}px ${border.type} ${border.color}`

    press_start = await new FontFace('Press Start',
        'url(assets/fonts/Press_Start_2P/PressStart2P-Regular.ttf)')
    document.fonts.add(press_start)

    c.font = '1em Press Start'
    c.fillStyle = '#000'
    c.fillRect(0, 0, canvas.width, canvas.height)
}

function load_image(url) {
    let img = new Image()
    return new Promise((resolve, reject) => {
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = url
    })
}

async function setup_images() {
    const result = await Promise.allSettled([
        load_image('assets/images/background.jpg'),
        load_image('assets/images/bread.png'),
        load_image('assets/images/brick.jpg'),
        load_image('assets/images/pigeon1.png'),
        load_image('assets/images/pigeon2.png'),
        load_image('assets/images/pigeon3.png'),
        load_image('assets/images/pigeon4.png'),
        load_image('assets/images/pigeon5.png'),
        load_image('assets/images/pigeon6.png'),
        load_image('assets/images/pigeon-wBread1.png'),
        load_image('assets/images/pigeon-wBread2.png'),
        load_image('assets/images/pigeon-wBread3.png'),
        load_image('assets/images/pigeon-wBread4.png'),
        load_image('assets/images/pigeon-wBread5.png'),
        load_image('assets/images/pigeon-wBread6.png'),
        load_image('assets/images/GF-zone.png'),
        load_image('assets/images/GF-bread.png'),
        load_image('assets/images/butter.png'),
    ])

    for (let img of result) {
        if (!img.value) return false

        // adding images to 'images' object by name of file without extension
        let src = img.value.src
        let name = src.slice(src.lastIndexOf('/') + 1, src.lastIndexOf('.'))
        images[name] = img.value
    }

    return true
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

function degs_to_rads(deg) {
    return (deg * Math.PI) / 180.0
}
