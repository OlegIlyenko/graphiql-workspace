export class KeepLastTaskQueue {
  constructor() {
    this.next = null
    this.curr = null
  }


  add(taskFn) {
    this.next = taskFn

    this.run()
  }

  run() {
    if (!this.curr && this.next) {
      this.curr = this.next

      this.curr()
        .then(v => {
          this.curr = null
          this.run()
          v
        }, error => {
          this.curr = null
          this.run()
        })
      this.next = null
    }
  }
}