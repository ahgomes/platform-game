/* ------------------------------------------------------------------
    ACTOR CLASS
------------------------------------------------------------------ */

class Actor {
    constructor(prop = {}) {
        this.image = prop.image
        this.width = (prop.width ?? (this.image ? this.image.width : 0))
        this.height = (prop.height ?? (this.image ? this.image.height : 0))
        this.x = prop.x || 0
        this.y = prop.y || canvas.height - this.height
        this.rotation = 0
    }

    act() {
        return this
    }

    draw() {
        if (!this.image) return

        if (this.rotation) {
            c.save()
            c.translate(this.x + this.width / 2, this.y + this.height / 2)
            c.rotate(degs_to_rads(this.rotation * 2))
            c.drawImage(this.image, 0, 0, this.width, this.height)
            c.translate(-(this.x + this.width / 2), -(this.y + this.height / 2))
            c.restore()
        } else c.drawImage(this.image, this.x, this.y, this.width, this.height)

        return this
    }

    update() {
        this.act()
            .draw()
    }

    static is_intersecting(a, b) {
        return !(a.x > b.x + b.width || b.x > a.x + a.width)
                && !(a.y > b.y + b.height || b.y > a.y + a.height)
    }

    static is_intersecting_offset(a, b, x, y) {
        x--; y--
        return !(a.x > b.x + b.width - x || b.x > a.x + a.width + x)
                && !(a.y > b.y + b.height - y || b.y > a.y + a.height + y)
    }
}

/* ------------------------------------------------------------------
    PLAYER
------------------------------------------------------------------ */

class Player extends Actor {
    static State = {
        ALIVE: 'alive',
        BIRD_DEATH: 'eaten',
        TOASTER_DEATH: 'burned',
        FALLING_DEATH: 'fallen',
        ZONE_DEATH: 'zoned'
    }

    static GRAVITY = 1

    constructor(prop = {}) {
        super(prop)
        this.direction = 0
        this.fall_direction = 0
        this.speed = 4
        this.jump_strength = 0
        this.can_jump = true
        this.is_jumping = false
        this.jump_count = 0
        this.meters_run = 0
        this.butter_count = 0
        this.state = Player.State.ALIVE
    }

    act() {
        switch (this.state) {
            case Player.State.BIRD_DEATH:
                this.width = 0
                break
            case Player.State.TOASTER_DEATH:
                this.image = images['burnt-bread']
                break
            case Player.State.FALLING_DEATH:
                this.y += this.height
                break
            case Player.State.ZONE_DEATH:
                this.image = images['GF-bread']
                this.rotation += this.fall_direction * 0.25
                this.y += 2
                break
        }

        if (this.state != Player.State.ALIVE) {
            this.direction = 0
            this.jump_strength = 0
            return this
        }

        if (is_key_down.up && this.can_jump && this.jump_count < 2) {
            this.jump_strength = -15
            this.can_jump = false
            this.is_jumping = true
            this.jump_count++
            this.y += this.jump_strength
        }

        if (this.is_jumping) {
            this.rotation = (this.jump_strength) ? this.jump_strength * 2 : 0.1
        }

        this.fall()

        if (!is_key_down.up) this.can_jump = true
        if (is_key_down.left && this.can_run(-1) && this.x > 0) {
            this.direction = -1
            if (this.x < START_SPACE || stop_back()) this.run()
            this.meters_run--
            this.rotation = -this.jump_strength * 1
        }
        if (is_key_down.right && this.can_run(1)) {
            this.direction = 1
            if (this.x < START_SPACE || stop_back()) this.run()
            this.meters_run++
        }

        if (!is_key_down.left && !is_key_down.right)
            this.direction = 0

        return this
    }

    can_run(dir) {
        return get_platform_at_offset(this.speed * this.direction - 1, 0) == null
    }

    fall() {
        //console.log(this.rotation, this.jump_strength);
        if (is_on_platform()) {
            let ground = get_platform_at_offset(0, 1)
            if (ground != null)
                this.y = ground.y - this.height
            this.jump_strength = 0
            this.jump_count = 0
            this.rotation = 0
            this.is_jumping = false
        } else {
            this.jump_strength += Player.GRAVITY
        }
        this.y += this.jump_strength
    }

    run() {
        this.x += this.direction * this.speed
    }
}

/* ------------------------------------------------------------------
    ENEMIES
------------------------------------------------------------------ */

class Pigeon extends Actor {
    constructor(prop = {}) {
        super(prop)
        this.width = 105
        this.height = 114
        this.images = prop.images
        this.images_b = prop.images_b
        this.image_index = 0
        this.has_hit_player = false
        this.direction = 1
        this.state = 0
        this.flap_rate = 5
    }

    act() {
        if (!this.state) return this

        if (!this.has_hit_player) {
            this.image = this.images[
                Math.floor(this.image_index++ / this.flap_rate)]
        } else {
            this.image = this.images_b[
                Math.floor(this.image_index++ / this.flap_rate)]
        }

        if (this.image_index >= this.images.length * this.flap_rate)
            this.image_index = 0

        this.fly()

        if (is_intersecting_player(this)) {
            this.has_hit_player = true
            this.width = 115
            is_bird_death(true)
        }

        return this
    }

    fly() {
        this.x -= 5
        this.y += (this.x > middle ? 1 : this.x > middle - GAP_LENGTH ? 0 : 1)
    }
}

class Toaster extends Actor {
    constructor(prop = {}) {
        super(prop)
    }
}

class Fire extends Actor {
    constructor(prop = {}) {
        super(prop)
    }
}

/* ------------------------------------------------------------------
    COLLECTABLES
------------------------------------------------------------------ */

class Butter extends Actor {
    static WIDTH = 65
    static HEIGHT = 26

    constructor(prop = {}) {
        super(prop)
        this.width = Butter.WIDTH
        this.height = Butter.HEIGHT
        this.is_collected = false
        this.float_up = true
        this.float_dist = 0
    }

    act() {
        if (is_intersecting_player(this) && !this.is_collected) {
            this.is_collected = true
            butter_inc()
        }

        if (this.is_collected && this.width > 0) {
            this.width -= 10
            this.height -= 10
            this.x += 5
            this.y += 5
        }

        if (this.width < 0) {
            this.width = 0
            return this
        }

        if (this.float_up && this.float_dist++ >= 10)
            this.float_up = false
        else if (!this.float_up && this.float_dist-- <= 0)
            this.float_up = true

        this.y += (this.float_up) ? -0.1 : 0.1

        return this
    }
}

/* ------------------------------------------------------------------
    PLATFORMS AND PLATFORM_SET ACTORS
------------------------------------------------------------------ */

class Platform extends Actor {
    constructor(prop = {}) {
        super(prop)
    }
}

class Falling extends Platform {
    constructor(prop = {}) {
        super(prop)
        this.falling_strength = 0
    }

    act() {
        if (is_intersecting_player(this)) {
            this.y += this.falling_strength
            this.falling_strength += 0.2
        }

        return this
    }

}

class Gluten_Free_Zone extends Actor {
    constructor(prop = {}) {
        super(prop)
    }

    act() {
        if (is_intersecting_player(this))
            is_zone_death(true)

        return this
    }
}

class Platform_Set extends Actor {
    constructor(prop = {}) {
        super(prop)
        this.x = prop.start_x || 0
        this.actors = []
        this.butter_pattern = prop.butter_pattern
        this.buttered = (this.butter_pattern) ? true : false
        this.instruc = prop.instruc || Platform_Set.rand_platform_string()
        this.create_platform_group(prop.start_x || 0)
    }

    act() {
        this.actors.forEach(a => a.act())
        return this
    }

    draw() {
        this.actors.forEach(a => a.draw())
        return this
    }

    move(player) {
        this.actors.forEach(a => a.x -= player.direction * player.speed)
        this.x -= player.direction * player.speed
    }

    get_x() { // get x value of last point of Platform_Set
        let last
        for (let i = this.actors.length - 1; i >= 0; i--) {
            last = this.actors[i]
            if (last instanceof Platform) break
        }
        return last.x + last.width
    }

    create_platform_group(start_x) {
        // TODO: add toasters
        let form = this.instruc.split('')
        let prev_width = this.x
        form.forEach((ch, i) => {
            let to_add
            let x = prev_width

            switch (ch) {
                case 'b': // box
                    to_add = new Platform({ x: x,
                        width: 120, height: 100, image: images.brick })
                    break
                case 's': // small
                    to_add = new Platform({ x: x,
                        width: 200, height: 50, image: images.brick })
                    break
                case 'm': // medium
                    to_add = new Platform({ x: x,
                        width: 200, height: 150, image: images.brick })
                    break
                case 't': // tall
                    to_add = new Platform({ x: x,
                        width: 150, height: 200, image: images.brick })
                    break
                case 'h': // tall
                    to_add = new Platform({ x: x,
                        width: 100, height: 150, image: images.brick })
                    break
                case 'f': // floating
                case 'd': // drop
                    if (i != 0 && form[i - 1] != ' ' && form[i - 1] != 'f'
                            && form[i - 1] != 'd') {
                        prev_width += GAP_LENGTH
                        x += GAP_LENGTH
                    }
                    let prop = { x: x, y: canvas.height - GAP_LENGTH,
                        width: GAP_LENGTH, height: 30, image: images.brick }
                    to_add = (ch == 'f') ? new Platform(prop)
                        : new Falling(prop)
                    if (i < form.length - 1 && form[i + 1] != ' ')
                        prev_width += GAP_LENGTH
                    break
                case ' ': // hole
                    prev_width += GAP_LENGTH
                    break
                case 'g': // gluten-free zone
                    to_add = new Gluten_Free_Zone({ x: x,
                        y: canvas.height - images['GF-zone'].height + 20,
                        image: images['GF-zone'] })
                    if (Math.random() < 0.4) {
                        this.actors.push(new Falling({
                            x: x + to_add.width / 2 - 5,
                            y: canvas.height - to_add.height - 100,
                            width: to_add.width / 2, height: 30,
                            image: images.brick }))
                    }
                    break
                case 'l': // long
                    to_add = new Platform({ x: x,
                        width: canvas.width, height: 50, image: images.brick })
                    break
            }

            if (!to_add) return

            this.actors.push(to_add)
            prev_width += to_add.width
            if ((this.buttered && i < this.butter_pattern.length
                    && this.butter_pattern[i])
                    || (!this.buttered && Math.random() < 0.5)) {

                this.actors.push(new Butter({
                    x: to_add.x + rand(10, to_add.width - Butter.WIDTH),
                    y: to_add.y - to_add.height - rand(10, 100),
                    image: images.butter }))
            }
        })

        this.width = prev_width
    }

    static rand_platform_string() {
        let types = ['l', 's', 'b', 'm', 't', 'f', 'd', 'h', 'hgh', ' ']
        let rand_str = ''
        let platform_count = rand(3, 7)

        for (let i = 0; i < platform_count; i++) {
            if (i != 0 && i != platform_count - 1
                    && rand_str[i - 1] != ' ') {
                rand_str += types[rand(0, types.length)]
            } else rand_str += types[rand(0, types.length - 1)]
        }

        return rand_str
    }
}

/* ------------------------------------------------------------------
    BACKGROUND ACTORS
------------------------------------------------------------------ */

class Background extends Actor {
    constructor(loc = -1, prop = {}) {
        super(prop)
        this.scale_to_fill()
        this.x = loc * this.width
        this.y = canvas.height - this.height
    }

    scale_to_fill() {
        let scale = Math.max(canvas.width / this.width,
                canvas.height / this.height)
        this.width *= scale
        this.height *= scale
    }
}

class Counter extends Actor {
    constructor(prop = {}) {
        super(prop)
        this.pre_text = prop.pre_text || ''
        this._num = prop.num || 0
        this.post_text = prop.post_text || ''
        this.text = this.pre_text + this._num + this.post_text
        this.text_align = prop.text_align || 'start'
    }

    // IDEA: add icons to counter

    draw() {
        c.font = '1em Press Start'
        c.textAlign = this.text_align
        c.textBaseline = 'top'
        c.strokeStyle = '#fff'
        c.lineWidth = 1
        c.fillStyle = '#000'
        c.strokeText(this.text, this.x, this.y)
        c.fillText(this.text, this.x, this.y)
        return this
    }

    get num() {
        return this._num
    }

    set num(n) {
        this._num = n
        this.text = this.pre_text + this._num + this.post_text
    }

    inc() {
        this._num++
        this.text = this.pre_text + this._num + this.post_text
    }

    dec() {
        this._num--
        this.text = this.pre_text + this._num + this.post_text
    }
}
