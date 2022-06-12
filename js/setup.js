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

function imageToBinary(image) {
    let outerArray = [], innerArray = []
    let data = image.data
    for (let i = 0; i < image.data.length; i += 4) {
        if ((i + 4) % (image.width * 4) === 0) {
            outerArray.push(innerArray)
            innerArray = []
        }
        innerArray.push((data[i] < 200) ? 0 : 1)
    }
    return outerArray
}

function binaryToPoints(image) {
    let array = []

    for (let i = 0; i < image.length; i += 1)
        for (let j = 0; j < image[0].length; j += 1)
            if (image[i][j] == 1) array.push({x: j + player.x, y: i + player.y})

    return array
}

function pixelate() {
    let img = c.getImageData(player.x, player.y, player.width, player.height)
    let shape = binaryToPoints(imageToBinary(img))
    console.log(img, shape)
    //clear_canvas()
    c.clearRect(0, 0, canvas.width, canvas.height)

    let points = shape
    let style = 'circle'
    for (let i = 0; i < points.length; i++) {
        c.beginPath()
        c.lineWidth = 1
        if (style == 'circle')
            c.arc(points[i].x, points[i].y, 1, 0, 2 * Math.PI)
        else if (style == 'square') {
            c.lineJoin = 'miter'
            c.rect(points[i].x, points[i].y, 1, 1)
        }
        c.closePath()
        c.stroke()

    }
}
