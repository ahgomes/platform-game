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

    set_position(x, y) {
        this.x = x
        this.y = y
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

class Background extends Actor {
    constructor(loc = -1, prop = {}) {
        super(prop)
        this.x = loc * this.width
        this.scale_to_fill()
        this.y = canvas.height - this.height
    }

    scale_to_fill() {
        let scale = Math.max(canvas.width / this.width,
                canvas.height / this.height)
        this.width *= scale
        this.height *= scale
    }
}

// QUESTION: removing actors from world?

class Platform_Set extends Actor {
    constructor(prop = {}) {
        super(prop)
        this.platforms = []
        this.instruc = prop.instruc || Platform_Set.rand_platform_string()
        this.create_platform_group(prop.start_x || 0)
    }

    draw() {
        this.platforms.forEach(p => p.draw())
        return this
    }

    move(player) {
        this.platforms.forEach(p => p.x = player.direction * player.speed)
    }

    get_x() {
        let last = this.platforms[this.platforms.length - 1]
        return last.x + last.width
    }

    create_platform_group(start_x) {
        // TODO: add toasters
        // TODO: add gluten-free zones
        // TODO: add falling
        let form = this.instruc.split('')
        let prev_width = 0
        form.forEach((ch, i) => {
            let to_add
            let x = start_x + prev_width

            switch (ch) {
                case 'b': // box
                    to_add = new Actor({ x: x,
                        width: 100, height: 100, image: images.brick })
                    break
                case 's': // small
                    to_add = new Actor({ x: x,
                        width: 200, height: 50, image: images.brick })
                    break
                case 'm': // medium
                    to_add = new Actor({ x: x,
                        width: 100, height: 150, image: images.brick })
                    break
                case 't': // tall
                    to_add = new Actor({ x: x,
                        width: 150, height: 200, image: images.brick })
                    break
                case 'f': // floating
                    if (i > 0 && form[i - 1] != ' ')
                        prev_width += 100
                    to_add = new Actor({ x: x + 100, y: canvas.height - 250,
                        width: 100, height: 30, image: images.brick })
                    if (i < form.length - 1 && form[i + 1] != ' ')
                        prev_width += 100
                    break
                case ' ': // hole
                    prev_width += 100
                    break
                case 'd': // drop
                case 'g': // gluten-free zone
                case 'l': // long
                default:
                    to_add = new Actor({ x: x,
                        width: canvas.width, height: 50, image: images.brick })
                    break
            }

            if (ch != ' ') prev_width += to_add.width

            if (to_add) this.platforms.push(to_add)
        })

        this.width = prev_width
    }

    static rand_platform_string() {
        let types = ['l', 's', 'b', 'm', 't', 'f', 'd', 'g', 'h', ' ']
        let rand_str = ''
        let platform_count = rand(1, 5)

        for (let i = 0; i < platform_count; i++) {
            if (i != 0 && i != platform_count - 1
                    && rand_str.lastIndexOf(' ') != i - 1) {
                rand_str += types[rand(0, types.length)]
            } else rand_str += types[rand(0, types.length - 1)]
        }

        return rand_str
    }
}

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
                // TODO
                break
            case Player.State.TOASTER_DEATH:
                this.image = images['burnt-bread']
                break
            case Player.State.FALLING_DEATH:
                this.y += this.height
                break
            case Player.State.ZONE_DEATH:
                this.image = images['GF-bread']
                this.rotation = 30
                this.y += 5
                break
        }

        if (this.state != Player.State.ALIVE) {
            this.direction = 0
            this.jump_strength = 0
            return
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
        if (is_key_down.left && this.can_run(-1) && this.meters_run > 0) {
            this.direction = -1
            if (this.meters_run < 300) this.run()
            this.meters_run--
            this.rotation = -this.jump_strength * 1
        }
        if (is_key_down.right && this.can_run(1)) {
            this.direction = 1
            if (this.meters_run < 300) this.run()
            this.meters_run++
        }

        if (!is_key_down.left && !is_key_down.right)
            this.direction = 0

        // TODO: Butter collection

        return this
    }

    can_run(dir) {
        return get_platform_at_offset(this.speed * this.direction, 0) == null
    }

    fall() {
        if (is_on_platform()) {
            this.y = get_platform_at_offset(1, 1).y - this.height
            this.jump_strength = 0
            this.jump_count = 0
            this.rotation = 0
            this.is_jumping = false
        } else this.jump_strength += Player.GRAVITY
        this.y += this.jump_strength
    }

    run() {
        this.x += this.direction * this.speed
    }
}
