const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

// ? collisions
const collisionsMap = [];
// ? 70 as each row is 70 tiles wide, with each tile being 12 pixels (48 after the 4x zoom)
for (let i = 0; i < collisionsData.length; i += 70) {
  collisionsMap.push(collisionsData.slice(i, i + 70));
}

// ? battle zones
const battleZonesMap = [];
for (let i = 0; i < battleZonesData.length; i += 70) {
  battleZonesMap.push(battleZonesData.slice(i, i + 70));
}

const boundaries = [];
const battleZones = [];
const offset = {
  // ? map offset
  x: -805,
  y: -600,
};

collisionsMap.map((row, i) => {
  row.map((symbol, j) => {
    if (symbol === 1025)
      boundaries.push(
        new Boundary({ position: { x: j * Boundary.width + offset.x, y: i * Boundary.height + offset.y } })
      );
  });
});

battleZonesMap.map((row, i) => {
  row.map((symbol, j) => {
    if (symbol === 1025)
      battleZones.push(
        new Boundary({ position: { x: j * Boundary.width + offset.x, y: i * Boundary.height + offset.y } })
      );
  });
});

const image = new Image();
image.src = "./img/Pellet Town.png";

const foregroundImage = new Image();
foregroundImage.src = "./img/Foreground.png";

const playerLeftImage = new Image();
playerLeftImage.src = "./img/playerLeft.png";

const playerRightImage = new Image();
playerRightImage.src = "./img/playerRight.png";

const playerUpImage = new Image();
playerUpImage.src = "./img/playerUp.png";

const playerDownImage = new Image();
playerDownImage.src = "./img/playerDown.png";

const player = new Sprite({
  position: { x: canvas.width / 2 - 192 / 2, y: canvas.height / 2 - 68 / 2 },
  image: playerDownImage,
  frames: { max: 4 },
  sprites: {
    up: playerUpImage,
    left: playerLeftImage,
    right: playerRightImage,
    down: playerDownImage,
  },
});

const background = new Sprite({ position: { x: offset.x, y: offset.y }, image: image });
const foreground = new Sprite({ position: { x: offset.x, y: offset.y }, image: foregroundImage });

const keys = {
  w: { pressed: false },
  a: { pressed: false },
  s: { pressed: false },
  d: { pressed: false },
};

const movables = [background, ...boundaries, foreground, ...battleZones];

function rectangularCollision(rectangle1, rectangle2) {
  return (
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y <= rectangle2.position.y + rectangle2.height - 40 &&
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y + 7
  );
}
const battle = {
  initiated: false,
};

function animate() {
  window.requestAnimationFrame(animate);
  background.draw();

  boundaries.forEach((boundary) => {
    boundary.draw();
  });
  battleZones.forEach((battleZone) => {
    battleZone.draw();
  });
  player.draw();
  foreground.draw();

  let moving = true;
  player.moving = false;

  if (battle.initiated) return;

  // ? activate battle
  if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
    for (let i = 0; i < battleZones.length; i++) {
      const battleZone = battleZones[i];
      const overlappingArea =
        (Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width) -
          Math.max(player.position.x, battleZone.position.x)) *
        (Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height) -
          Math.max(player.position.y, battleZone.position.y));

      // ? detect if player is ontop of a battlezone
      if (
        rectangularCollision(player, battleZone) &&
        overlappingArea > (player.width * player.height) / 1.9 &&
        Math.random() < 0.01
      ) {
        console.log("BATTLE!");
        battle.initiated = true;
        break;
      }
    }
  }

  // ? player movement

  if (keys.w.pressed && lastKey === "w") {
    player.moving = true;
    player.image = player.sprites.up;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      // ? detect collisions
      if (
        rectangularCollision(player, {
          ...boundary,
          position: { x: boundary.position.x, y: boundary.position.y + background.velocity },
        })
      ) {
        moving = false;
        break;
      }
    }

    if (moving) movables.forEach((movable) => (movable.position.y += background.velocity));
  } else if (keys.s.pressed && lastKey === "s") {
    player.moving = true;
    player.image = player.sprites.down;

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      // ? detect collisions
      if (
        rectangularCollision(player, {
          ...boundary,
          position: { x: boundary.position.x, y: boundary.position.y - background.velocity },
        })
      ) {
        moving = false;
        break;
      }
    }
    if (moving) movables.forEach((movable) => (movable.position.y -= background.velocity));
  } else if (keys.a.pressed && lastKey === "a") {
    player.moving = true;
    player.image = player.sprites.left;

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      // ? detect collisions
      if (
        rectangularCollision(player, {
          ...boundary,
          position: { x: boundary.position.x + background.velocity, y: boundary.position.y },
        })
      ) {
        moving = false;
        break;
      }
    }
    if (moving) movables.forEach((movable) => (movable.position.x += background.velocity));
  } else if (keys.d.pressed && lastKey === "d") {
    player.moving = true;
    player.image = player.sprites.right;
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];

      // ? detect collisions
      if (
        rectangularCollision(player, {
          ...boundary,
          position: { x: boundary.position.x - background.velocity, y: boundary.position.y },
        })
      ) {
        moving = false;
        break;
      }
    }
    if (moving) movables.forEach((movable) => (movable.position.x -= background.velocity));
  }
}
animate();

let lastKey = "";
window.addEventListener("keydown", (evt) => {
  switch (evt.key) {
    case "w":
      keys.w.pressed = true;
      lastKey = "w";
      break;
    case "a":
      keys.a.pressed = true;
      lastKey = "a";
      break;
    case "s":
      keys.s.pressed = true;
      lastKey = "s";
      break;
    case "d":
      keys.d.pressed = true;
      lastKey = "d";
      break;
    default:
      break;
  }
});

window.addEventListener("keyup", (evt) => {
  switch (evt.key) {
    case "w":
      keys.w.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
    case "s":
      keys.s.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
    default:
      break;
  }
});
