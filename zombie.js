import * as PIXI from "pixi.js";
import Victor from "victor";
import { zombies } from "./globals.js";

export default class Zombie {
  constructor({ app, player }) {
    this.app = app;
    this.player = player;
    this.level = this.player.level;
    this.speed = this.level * 2; //zombie speed
    let r = this.randomSpawnPoint();

    let zombieName = zombies[Math.floor(Math.random() * zombies.length)]; // one of the zombie names randomly
    this.zombieName = zombieName;
    if(zombieName === "quickzee" || zombieName === "dogzee"){
      this.speed = this.speed * 1;
    } 
    else if(zombieName === "tankzee" || zombieName === "copzee"){
      this.speed = this.speed * 0.75;
    }
    else {
      this.speed = this.speed * 0.5;
    }
    let sheet =
      PIXI.Loader.shared.resources[`assets/${zombieName}.json`].spritesheet;

    this.die = new PIXI.AnimatedSprite(sheet.animations["die"]);
    this.attack = new PIXI.AnimatedSprite(sheet.animations["attack"]);
    this.zombie = new PIXI.AnimatedSprite(sheet.animations["walk"]);
    this.zombie.animationSpeed = zombieName === "quickzee" ? 0.2 : 0.1;
    this.zombie.play();
    this.zombie.anchor.set(0.5);
    this.zombie.position.set(r.x, r.y);
    app.stage.addChild(this.zombie);
    this.audio = new Audio("./assets.squelch.mp3");
  }

  attackPlayer() {
    if (this.attacking) return;
    this.attacking = true;
    this.interval = setInterval(() => this.player.attack(), 500);
    this.zombie.textures = this.attack.textures;
    this.zombie.animationSpeed = 0.1;
    this.zombie.play();
  }

  update(delta) {
    let e = new Victor(this.zombie.position.x, this.zombie.position.y); // zombie
    let s = new Victor(this.player.position.x, this.player.position.y); // square/player
    if (e.distance(s) < this.player.width / 2) {
      this.attackPlayer();
      return;
    }
    let d = s.subtract(e); // subtract zombie position from player position(to find direction)
    let v = d.normalize().multiplyScalar(this.speed * delta); // convert direction vector to a unit vector (magnitute of 1 always)
    this.zombie.scale.x = v.x < 0 ? 1 : -1; // flip zombie
    this.zombie.position.set(
      this.zombie.position.x + v.x,
      this.zombie.position.y + v.y
    );
  }

  kill() {
    this.audio.currentTime = 0;
    this.audio.play();
    this.zombie.textures = this.die.textures;
    this.zombie.loop = false;
    switch(this.zombieName) {
      case 'tankzee':
        this.player.setPlayerScore(this.player.getPlayerScore() + 2);
        break;
      case 'dogzee':
        this.player.setPlayerScore(this.player.getPlayerScore() + 5);
        break;
      case 'femalezee':
        this.player.setPlayerScore(this.player.getPlayerScore() + 1);
        break;
      case 'nursezee':
        this.player.setPlayerScore(this.player.getPlayerScore() + 1);
        break;
      case 'quickzee':
        this.player.setPlayerScore(this.player.getPlayerScore() + 5);
        break; 
      case 'copzee':
        this.player.setPlayerScore(this.player.getPlayerScore() + 2);
        break;  
      default:
        this.player.setPlayerScore(this.player.getPlayerScore() + 1);
        break;     
    }
    this.zombie.onComplete = () =>
      setTimeout(() => this.app.stage.removeChild(this.zombie), 20000); // remove dead zombie (20s)
    this.zombie.play();
    this.zombie.zIndex = -1; //player infront of dead zombies
    clearInterval(this.interval);
    return this.player.score;
  }

  get position() {
    return this.zombie.position;
  }

  randomSpawnPoint() {
    let edge = Math.floor(Math.random() * 4); // random int between 0 and 3 inclusive
    let spawnPoint = new Victor(0, 0);
    let canvasSize = this.app.screen.width;
    switch (edge) {
      case 0: // top
        spawnPoint.x = canvasSize * Math.random();
        break;
      case 1: // right
        spawnPoint.x = canvasSize;
        spawnPoint.y = canvasSize * Math.random();
        break;
      case 2: // bottom
        spawnPoint.x = canvasSize * Math.random();
        spawnPoint.y = canvasSize;
        break;
      default:
        // left
        spawnPoint.x = 0;
        spawnPoint.y = canvasSize * Math.random();
        break;
    }
    return spawnPoint;
  }
}
