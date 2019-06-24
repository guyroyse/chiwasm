describe("Chiwasm.Memory", () => {

  beforeEach(() => {
    this.subject = new Chiwasm.Memory(1, 'foo', 'bar')
    this.array = new Uint8Array(this.subject.memory.buffer)
  })

  describe("#writeByte", () => {

    it("writes a byte to the beginning of memory", () => {
      this.subject.writeByte(0, 42)
      expect(this.array[0]).toBe(42)
    })

    it("writes a byte to other places in memory", () => {
      this.subject.writeByte(12, 23)
      expect(this.array[12]).toBe(23)
    })

  })

  describe("#readByte", () => {

    it("reads a byte at the beginning of memory", () => {
      this.array[0] = 42
      this.subject.writeByte(0, 42)
      expect(this.array[0]).toBe(42)
    })

    it("writes a byte to other places in memory", () => {
      this.array[12] = 23
      this.subject.writeByte(12, 23)
      expect(this.array[12]).toBe(23)
    })

  })

  describe("#readString", () => {

    beforeEach(() => {
      this.array[0] = 102, this.array[1] = 111, this.array[2] = 111, this.array[3] = 0
      this.array[4] = 98, this.array[5] = 97, this.array[6] = 114, this.array[7] = 0
    })

    it("reads a string from the beginning of memory", () => {
      let result = this.subject.readString(0)
      expect(result).toBe("foo")
    })

    it("reads a string from other places in memory", () => {
      let result = this.subject.readString(4)
      expect(result).toBe("bar")
    })

  })

  describe("#writeString", () => {

    it("writes a string at the beginning of memory", () => {
      this.subject.writeString(0, "foo")
      expect(this.array.slice(0, 4)).toEqual(new Uint8Array([102, 111, 111, 0]))
    })

    it("writes a string at other places in memory", () => {
      this.subject.writeString(4, "bar")
      expect(this.array.slice(4, 8)).toEqual(new Uint8Array([98, 97, 114, 0]))
    })

  })

  describe("#addToImports", () => {

    it("adds the memory to the imports object", () => {
      let imports = {}
      this.subject.addToImports(imports)
      expect(imports.foo.bar).toBe(this.subject.memory)
    })

  })

})
