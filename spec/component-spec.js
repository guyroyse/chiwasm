describe("Chiwasm.Component", () => {

  beforeEach(() => {
    this.subject = new Chiwasm.Component()
  })

  describe("#modulePath", () => {
    it("returns the value in the 'wasm' attribute", () => {
      this.subject.setAttribute('wasm', 'foo')
      expect(this.subject.modulePath).toBe('foo')
    })
  })

  describe("#memoryGroup", () => {

    when("the 'memoryGroup' attribute is missing", () => {

      it("returns the value of 'env'", () => {
        expect(this.subject.memoryGroup).toBe('env')
      })

    })

    when("the 'memoryGroup' attribute has a value", () => {

      beforeEach(() => {
        this.subject.setAttribute('memoryGroup', 'foo')
      })

      it("returns the value in the 'memoryGroup' attribute", () => {
        expect(this.subject.memoryGroup).toBe('foo')
      })

    })

  })

  describe("#memoryName", () => {

    when("the 'memoryName' attribute is missing", () => {

      it("returns the value of 'memory'", () => {
        expect(this.subject.memoryName).toBe('memory')
      })

    })

    when("the 'memoryName' attribute has a value", () => {

      beforeEach(() => {
        this.subject.setAttribute('memoryName', 'foo')
      })

      it("returns the value in the 'memoryName' attribute", () => {
        expect(this.subject.memoryName).toBe('foo')
      })

    })

  })

  describe("#memorySize", () => {

    when("the 'memorySize' attribute is missing", () => {

      it("returns the value of 1", () => {
        expect(this.subject.memorySize).toBe(1)
      })

    })

    when("the 'memorySize' has a numeric value", () => {

      beforeEach(() => {
        this.subject.setAttribute('memorySize', '42')
      })

      it("returns the value in the 'memorySize' attribute as a number", () => {
        expect(this.subject.memorySize).toBe(42)
      })

    })

    when("the 'memorySize' has a non-numeric value", () => {

      beforeEach(() => {
        this.subject.setAttribute('memorySize', 'foo')
      })

      it("returns NaN", () => {
        expect(this.subject.memorySize).toEqual(NaN)
      })

    })

  })

  when("connected to an element", () => {

    beforeEach(() => {
      spyOn(Chiwasm, 'Memory').and.callThrough()
      this.subject.connectedCallback()
    })

    it("creates a Chiwasm.Memory of size, group, and name", () => {
      expect(Chiwasm.Memory).toHaveBeenCalled()
    })

  })

})
