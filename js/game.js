let inplay = false
let game_over = false
let loaded = false

let images = {}
let actors = {}
let player

const GAP_LENGTH = 150
const START_SPACE = 30

async function init() {
    await setup_canvas()


    const result = await Promise.allSettled([
        //load_image(canvas.toDataURL()),
        load_image('images/background.jpg'),
        load_image('images/bread.png'),
        load_image('images/brick.jpg'),
        load_image('images/pigeon1.png'),
        load_image('images/pigeon2.png'),
        load_image('images/pigeon3.png'),
        load_image('images/pigeon4.png'),
        load_image('images/pigeon5.png'),
        load_image('images/pigeon6.png'),
        load_image('images/pigeon-wBread1.png'),
        load_image('images/pigeon-wBread2.png'),
        load_image('images/pigeon-wBread3.png'),
        load_image('images/pigeon-wBread4.png'),
        load_image('images/pigeon-wBread5.png'),
        load_image('images/pigeon-wBread6.png'),
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
        new Platform_Set({instruc: 'ssbs s'})]

    player = new Player({
        x: 100,
        y: actors.p_sets[0].platforms[0].y - images.bread.height,
        width: 80, height: 40,
        image: images.bread })
    actors['player'] = player

    let p_imgs = []
    let p_imgs_b = []

    for (let i = 0, b = false; i < 6;) {
        if (!b) p_imgs.push(images['pigeon' + (i + 1)])
        else p_imgs_b.push(images['pigeon-wBread' + (i + 1)])

        if (++i == 6 && !b) {
            i = 0; b = true
        }
    }

    actors['pigeon'] = new Pigeon({
        x: canvas.width + GAP_LENGTH,
        y: GAP_LENGTH,
        images: p_imgs,
        images_b: p_imgs_b,
    })


    inplay = true
    animate()
}

function animate() {
    console.log(player.state)

    if (is_game_over()) {
        if (player.y > canvas.height)
            player.state = Player.State.FALLING_DEATH
        // TODO: Game over screen
        console.log(player.state)
        console.log('game over')
        game_over = true
        inplay = false
        return
    }


    c.clearRect(0, 0, canvas.width, canvas.height)

    // TODO: animate like ya obvi

    let last_p_sets = actors.p_sets[actors.p_sets.length - 1]
    if (last_p_sets.get_x() + GAP_LENGTH < canvas.width)
        actors.p_sets.push(new Platform_Set({start_x: canvas.width}))

    if (player.meters_run >= START_SPACE && player.direction != 0
            && player.can_run(player.direction))
        move_game()

    if (Math.random() * 6 < 0.01 && !actors.pigeon.state) {
        actors.pigeon.x = canvas.width + GAP_LENGTH
        actors.pigeon.y = GAP_LENGTH
        actors.pigeon.state = 1
    }

    if (actors.pigeon.state && actors.pigeon.x < -GAP_LENGTH)
        actors.pigeon.state = 0

    Object.entries(actors).forEach(([_, value]) => {
        if (Array.isArray(value)) {
            value.forEach(el => el.update())
            return
        }
        value.update()
    })

    //let plate = actors.p_sets[0].platforms[0]
    //console.log(Actor.is_intersecting_offset(player, plate, 10, 10));

    if (inplay && loaded) requestAnimationFrame(animate)
}

function move_game() {
    actors.bkgds.forEach(b => {
        if (b.x + b.width < 0) b.x = b.width - 1
        b.x -= player.direction
    })

    actors.p_sets.forEach(p => p.move(player))

    if (actors.pigeon) actors.pigeon.x -= player.direction * player.speed
}

function is_game_over() {
    return player.y > canvas.height || player.state != Player.State.ALIVE
}

function is_on_platform() {
    for (let set of actors.p_sets) {
        for (let platform of set.platforms) {
            if (Actor.is_intersecting(player, platform))
                return true
        }
    }

    return false
}

function get_platform_at_offset(x, y) {
    for (let set of actors.p_sets) {
        for (let platform of set.platforms) {
            if (Actor.is_intersecting_offset(player, platform, x, y))
                return platform
        }
    }

    return null
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
