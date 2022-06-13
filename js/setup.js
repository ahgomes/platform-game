const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

let center, middle
let press_start
let images = {}

async function setup_canvas() {
    const margin = 50
    const border = { width: 40, type: "solid", color: "#2d2d2d" }

    canvas.height = window.innerHeight - (margin * 2) - (border.width * 2)
    canvas.width = canvas.height * (4 / 3)
    center = canvas.width / 2
    middle = canvas.height / 2

    canvas.style.display = 'block'
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
    const urls = ['background.jpg', 'bread.png', 'brick.jpg', 'burnt-bread.png',
        'butter.png', 'GF-bread.png', 'GF-zone.png']
    for (let i = 0; i < 8; i++) {
        if (i < 5) urls.push(`toasterAttack${i + 1}.png`)
        if (i < 6) {
            urls.push(`pigeon${i + 1}.png`)
            urls.push(`pigeon-wBread${i + 1}.png`)
            urls.push(`toasterWalk${i + 1}.png`)
        }
        urls.push(`fire${i + 1}.png`)
    }

    const result = await Promise.allSettled(urls.map(async url => {
        return await load_image('assets/images/' + url)
    }))

    for (let img of result) {
        if (!img.value) return false

        // adding images to 'images' object by name of file without extension
        img.value.crossOrigin = 'anonymous'
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
