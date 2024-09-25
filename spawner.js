import GameState from "./game-state.js";

export default class Spawner {
  constructor({ app, create }) {
    this.app = app;
    const spawnInterval = 300; // in miliseconds
    this.maxSpawns = 45; // number of zombies spawned
    this.create = create;
    this.spawns = [];
    setInterval(() => this.spawn(), spawnInterval);
  }

  spawn() {
    if (this.app.gameState !== GameState.RUNNING) return;
    if (this.spawns.length >= this.maxSpawns) return;
    let s = this.create();
    this.spawns.push(s);
  }
}
