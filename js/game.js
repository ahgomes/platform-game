/* ------------------------------------------------------------------
    SETUP
------------------------------------------------------------------ */

let inplay = false
let game_over = false
let loaded = false

let actors = {}
let player

// pigeon images
let p_imgs = [] // no bread
let p_imgs_b = [] // w/ bread

const GAP_LENGTH = 150
const START_SPACE = 130
const MAX_P_SETS = 10

async function init() {
    // loading canvas ans images if possible
    if (!loaded) {
        await setup_canvas()
        loaded = await setup_images()
        if (!loaded) {
            c.clearRect(0, 0, canvas.width, canvas.height)
            c.fillStyle = '#fff'
            let text = 'Error: Missing images.'
            let text_width = c.measureText(text).width
            c.fillText(text, center - text_width / 2, middle)
            return
        }

        // setting up pigeon image arrays
        for (let i = 0, b = false; i < 6;) {
            if (!b) p_imgs.push(images['pigeon' + (i + 1)])
            else p_imgs_b.push(images['pigeon-wBread' + (i + 1)])

            if (++i == 6 && !b) {
                i = 0; b = true
            }
        }
    }

    // -- Creating Actors --

    actors['bkgds'] = [
        new Background(0, {image: images.background}),
        new Background(1, {image: images.background}) ]

    actors['p_sets'] = [
        new Platform_Set({instruc: 'ssbs s', butter_pattern: [0, 0, 1]})]

    player = new Player({
        x: 100,
        y: actors.p_sets[0].actors[0].y - images.bread.height,
        width: 80, height: 40,
        image: images.bread })
    actors['player'] = player

    actors['pigeon'] = new Pigeon({
        x: canvas.width + GAP_LENGTH,
        y: GAP_LENGTH,
        images: p_imgs,
        images_b: p_imgs_b,
    })

    actors['butter_counter'] = new Counter({
        x: 10, y: 10,
        pre_text: 'BUTTER: '
    })

    actors['meter_counter'] = new Counter({
        x: canvas.width - 10, y: 10,
        post_text: 'm', text_align: 'end'
    })

    inplay = true
    animate()
}

/* ------------------------------------------------------------------
    RUNNING
------------------------------------------------------------------ */

function animate() {
    // game over
    // checking all animations done
    if (is_game_over()) {
        if (player.y - player.height > canvas.height) {
            if (player.state == Player.State.ALIVE)
                player.state = Player.State.FALLING_DEATH
            inplay = false
        }

        if ((player.state == Player.State.BIRD_DEATH && !actors.pigeon.state)
                || player.state == Player.State.TOASTER_DEATH) {
            inplay = false
        }

        game_over = true
    }

    // game over and all animations done
    // display game over screen
    if (!inplay) {
        if (game_over) { // adding restart instruction to game over text
            game_over_screen()
            let go_text = c.measureText('GAME OVER')
            c.font = '1em Press Start'
            c.lineWidth = 2
            c.strokeText('[PRESS SPACE TO RESTART]', center,
                middle + go_text.actualBoundingBoxDescent + 50)
            c.fillText('[PRESS SPACE TO RESTART]', center,
                middle + go_text.actualBoundingBoxDescent + 50)
        }
        return
    }

    // clear canvas
    c.clearRect(0, 0, canvas.width, canvas.height)

    // adding new Platform_Set ahead of screen
    let last_p_sets = actors.p_sets[actors.p_sets.length - 1]
    if (last_p_sets.get_x() + GAP_LENGTH < canvas.width)
        actors.p_sets.push(new Platform_Set({start_x: canvas.width}))

    // removing Platform_Set at capacity
    if (actors.p_sets.length > MAX_P_SETS)
        actors.p_sets.shift()

    // moving non-player game actors
    if (player.x >= START_SPACE && player.direction != 0
            && player.can_run(player.direction) && !stop_back())
        move_game()

    // reseting pigeon
    if (Math.random() * 6 < 0.01 && !actors.pigeon.state) {
        actors.pigeon.x = canvas.width + GAP_LENGTH
        actors.pigeon.y = GAP_LENGTH
        actors.pigeon.height = 114
        actors.pigeon.state = 1
    }

    // deactiving pigeon
    if (actors.pigeon.state && actors.pigeon.x < -GAP_LENGTH) {
        actors.pigeon.state = 0
        actors.pigeon.height = 0
    }

    // updating all actors
    Object.entries(actors).forEach(([_, value]) => {
        if (Array.isArray(value)) {
            value.forEach(el => el.update())
            return
        }
        value.update()
    })

    if (game_over) game_over_screen()
    if (inplay && loaded) requestAnimationFrame(animate)
}

// clear canvas and reset properties
function restart() {
    c.clearRect(0, 0, canvas.width, canvas.height)

    inplay = false
    game_over = false
    actors = {}
    player = undefined

    init()
}

/* ------------------------------------------------------------------
    ANIMATION HELPERS
------------------------------------------------------------------ */

// move Pigeon, Background's, Platform_Set's, and update meter counter
function move_game() {
    if (actors.pigeon) actors.pigeon.x -= player.direction * player.speed

    if (game_over) return

    actors.bkgds.forEach(b => {
        if (b.x + b.width < 0) b.x = b.width - 1
        b.x -= player.direction
    })

    actors.p_sets.forEach(p => p.move(player))

    actors.meter_counter.num = Math.floor(player.meters_run / 50)
}

// if trying to move backwards and background at end return true
// otherwise false
function stop_back() {
    if (player.direction >= 0) return false

    let [b1, b2] = actors.bkgds
    return (b1.x >= -1 && b2.x >= canvas.width - 1) ||
        (b2.x >= -1 && b1.x >= canvas.width - 1)
}

function game_over_screen() {
    c.font = '3em Press Start'
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.lineWidth = 4
    c.strokeStyle = '#fff'
    c.strokeText('GAME OVER', center, middle)
    c.fillStyle = '#000'
    c.fillText('GAME OVER', center, middle)
}

function is_game_over() {
    return player.y > canvas.height || player.state != Player.State.ALIVE
}

function butter_inc() {
    player.butter_count++
    actors.butter_counter.inc()
}

/* ------------------------------------------------------------------
    DEATH HELPERS
------------------------------------------------------------------ */

// in Gluten_Free_Zone
function is_zone_death(yes) {
    if (player == undefined) return false
    if (player.state == Player.State.ZONE_DEATH) return true
    if (yes) {
        player.state = Player.State.ZONE_DEATH
        player.fall_direction = player.direction
        return true
    }
}

// eaten by Pigeon
function is_bird_death(yes) {
    if (player == undefined) return false
    if (player.state == Player.State.BIRD_DEATH) return true
    if (yes) {
        player.state = Player.State.BIRD_DEATH
        return true
    }
}

/* ------------------------------------------------------------------
    COLLISION DETECTION
------------------------------------------------------------------ */

function is_on_platform() {
    if (actors == undefined) return false
    for (let set of actors.p_sets) {
        for (let platform of set.actors) {
            if (Actor.is_intersecting(player, platform)
                    && platform instanceof Platform)
                return true
        }
    }

    return false
}

function get_platform_at_offset(x, y) {
    if (actors == undefined) return null
    for (let set of actors.p_sets) {
        for (let platform of set.actors) {
            if (Actor.is_intersecting_offset(player, platform, x, y)
                    && platform instanceof Platform)
                return platform
        }
    }

    return null
}

function is_intersecting_player(actor) {
    //if (player.rotation <= 0.1 && player.rotation >= -0.1)
        return Actor.is_intersecting(player, actor)
    //return Actor.is_intersecting_offset(player, actor, 44, 0)
}

function is_player_at_offset(actor, x, y) {
    return Actor.is_intersecting_offset(player, actor, x, y)
}

/* ------------------------------------------------------------------
    KEYBOARD ACTIONS
------------------------------------------------------------------ */

let is_key_down = {
    left: false,
    up: false,
    right: false,
    down: false,
}

window.onkeydown = function(e) {
    let k = e.keyCode - 37
    if (k >= 0 && k < 4)
        is_key_down[Object.keys(is_key_down)[k]] = true

    if (game_over && !inplay && e.keyCode == 32)
        restart()
}

window.onkeyup = function(e) {
    let k = e.keyCode - 37
    if (k >= 0 && k < 4) {
        is_key_down[Object.keys(is_key_down)[k]] = false
    }
}

/* ------------------------------------------------------------------
    ONLOAD
------------------------------------------------------------------ */

window.onload = init()
