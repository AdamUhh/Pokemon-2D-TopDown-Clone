const battleBackgroundImage = new Image();
battleBackgroundImage.src = "./img/battleBackground.png";
const battleBackground = new Sprite({ position: { x: 0, y: 0 }, image: battleBackgroundImage });

let draggle;
let emby;
let renderedSprites;
let queue;

let battleAnimationId;

function initBattle() {
  document.querySelector("#userInterface").style.display = "block";
  document.querySelector("#dialogueBox").style.display = "none";
  document.querySelector("#enemyHealthBar").style.width = "100%";
  document.querySelector("#playerHealthBar").style.width = "100%";
  document.querySelector("#attacksBox").replaceChildren();

  draggle = new Monster(monsters.Draggle);
  emby = new Monster(monsters.Emby);
  renderedSprites = [draggle, emby];

  emby.attacks.forEach((attack) => {
    const button = document.createElement("button");
    button.innerHTML = attack.name;
    document.querySelector("#attacksBox").append(button);
  });

  queue = [];

  // attack button event listeners
  document.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", (evt) => {
      const selectedAttack = attacks[evt.currentTarget.innerHTML];

      emby.attack({
        attack: selectedAttack,
        recipient: draggle,
        renderedSprites,
      });

      if (draggle.health <= 0) {
        queue.push(() => {
          draggle.faint();
        });
        queue.push(() => {
          // ? fade to black
          gsap.to("#overlappingDiv", {
            opacity: 1,
            onComplete: () => {
              cancelAnimationFrame(battleAnimationId);
              animate();
              document.querySelector("#userInterface").style.display = "none";
              gsap.to("#overlappingDiv", {
                opacity: 0,
              });
              battle.initiated = false;
              audio.Map.play();
            },
          });
        });
        return;
      }

      // ? target attacks
      const randomAttack = draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)];

      queue.push(() => {
        draggle.attack({
          attack: randomAttack,
          recipient: emby,
          renderedSprites,
        });

        if (emby.health <= 0) {
          queue.push(() => {
            emby.faint();
          });

          queue.push(() => {
            // ? fade to black
            gsap.to("#overlappingDiv", {
              opacity: 1,
              onComplete: () => {
                cancelAnimationFrame(battleAnimationId);
                animate();
                document.querySelector("#userInterface").style.display = "none";
                gsap.to("#overlappingDiv", {
                  opacity: 0,
                });
                battle.initiated = false;
                audio.Map.play();
              },
            });
          });
        }
      });
    });

    btn.addEventListener("mouseenter", (evt) => {
      const selectedAttack = attacks[evt.currentTarget.innerHTML];
      const h1 = document.querySelector("#AttackType");
      h1.innerHTML = selectedAttack.type;
      h1.style.color = selectedAttack.color;
    });
  });
}

function animateBattle() {
  battleAnimationId = window.requestAnimationFrame(animateBattle);
  battleBackground.draw();

  renderedSprites.forEach((sprite) => {
    sprite.draw();
  });
}
animate();

// initBattle();
// animateBattle();

document.querySelector("#dialogueBox").addEventListener("click", (evt) => {
  if (queue.length > 0) {
    queue[0]();
    queue.shift();
  } else {
    evt.currentTarget.style.display = "none";
  }
});
