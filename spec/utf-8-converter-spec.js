describe("Utf8Converter", () => {

  beforeEach(() => {
    this.subject = new Chiwasm.Utf8Converter()
  })

  describe("#bytesToString", () => {

    it("converts empty byte array to empty string", () => {
      let array = new Uint8Array(0)
      let result = this.subject.bytesToString(array)
      expect(result).toBe("")
    })

    it("converts byte array containing a single null to empty string", () => {
      let array = new Uint8Array([0])
      let result = this.subject.bytesToString(array)
      expect(result).toBe("")
    })

    it("converts byte array starting with null to empty string", () => {
      let array = new Uint8Array([0, 102, 111, 111])
      let result = this.subject.bytesToString(array)
      expect(result).toBe("")
    })

    it("converts byte array with ASCII bytes to ASCII string", () => {
      let array = new Uint8Array([102, 111, 111])
      let result = this.subject.bytesToString(array)
      expect(result).toBe("foo")
    })

    it("converts byte array with null-terminated ASCII bytes to ASCII string", () => {
      let array = new Uint8Array([102, 111, 111, 0])
      let result = this.subject.bytesToString(array)
      expect(result).toBe("foo")
    })

    it("converts byte array with null-terminated ASCII bytes and data beyond to ASCII string", () => {
      let array = new Uint8Array([102, 111, 111, 0, 98, 114, 114])
      let result = this.subject.bytesToString(array)
      expect(result).toBe("foo")
    })

    it("converts byte array with UTF-8 bytes to UTF-8 string", () => {
      let array = new Uint8Array([102, 111, 111, 32, 226, 156, 136, 239, 184, 143, 32, 98, 97, 114])
      let result = this.subject.bytesToString(array)
      expect(result).toBe("foo ✈️ bar")
    })

    it("converts byte array with null terminated UTF-8 bytes to UTF-8 string", () => {
      let array = new Uint8Array([102, 111, 111, 32, 226, 156, 136, 239, 184, 143, 32, 98, 97, 114, 0])
      let result = this.subject.bytesToString(array)
      expect(result).toBe("foo ✈️ bar")
    })

    it("converts byte array with null terminated UTF-8 bytes and data beyond to UTF-8 string", () => {
      let array = new Uint8Array([102, 111, 111, 32, 226, 156, 136, 239, 184, 143, 32, 98, 97, 114, 0, 98, 114, 122])
      let result = this.subject.bytesToString(array)
      expect(result).toBe("foo ✈️ bar")
    })

  })

  describe("#stringToBytes", () => {

    it("converts empty string to byte array containing a single null", () => {
      let result = this.subject.stringToBytes("")
      expect(result).toEqual(new Uint8Array([0]))
    })

    it("converts ASCII string to byte array with null-terminated ASCII bytes", () => {
      let result = this.subject.stringToBytes("foo")
      expect(result).toEqual(new Uint8Array([102, 111, 111, 0]))
    })

    it("converts UTF-8 string to byte array with null-terminated UTF-8 bytes", () => {
      let result = this.subject.stringToBytes("foo ✈️ bar")
      expect(result).toEqual(new Uint8Array([102, 111, 111, 32, 226, 156, 136, 239, 184, 143, 32, 98, 97, 114, 0]))
    })

  })

})