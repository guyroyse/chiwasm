describe("MemoryManager", () => {

  beforeEach(() => {
    this.subject = new Chiwasm.MemoryManager()
  })

  describe("#extractString", () => {

    beforeEach(() => {
      let array = new Uint8Array(this.subject.memory.buffer)
      array[0] = 102, array[1] = 111, array[2] = 111, array[3] = 0
      array[4] = 98, array[5] = 97, array[6] = 114, array[7] = 0
    })

    it("extracts a string from the beginning of memory", () => {
      let result = this.subject.extractString(0)
      expect(result).toBe("foo")
    })

    it("extracts a string from other places in memory", () => {
      let result = this.subject.extractString(4)
      expect(result).toBe("bar")
    })

  })

  describe("#injectString", () => {

    beforeEach(() => {
      this.array = new Uint8Array(this.subject.memory.buffer)
    })

    it("injects a string at the beginning of memory", () => {
      this.subject.injectString(0, "foo")
      expect(this.array.slice(0, 4)).toEqual(new Uint8Array([102, 111, 111, 0]))
    })

    it("injects a string at other places in memory", () => {
      this.subject.injectString(4, "bar")
      expect(this.array.slice(4, 8)).toEqual(new Uint8Array([98, 97, 114, 0]))
    })

  })

})