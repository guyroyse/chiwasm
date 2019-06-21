const Chiwasm = (function() {

  class Utf8Converter {
    constructor() {
      this.decoder = new TextDecoder("utf8")
      this.encoder = new TextEncoder()
    }

    bytesToString(bytes) {
      let index = bytes.indexOf(0)
      let array = index === -1 ? bytes : bytes.slice(0, index)
      return this.decoder.decode(new Uint8Array(array))
    }

    stringToBytes(string) {
      let array = Array.from(this.encoder.encode(string))
      array.push(0)
      return new Uint8Array(array)
    }

  }

  class MemoryManager {
    constructor(memory) {
      this.utf8 = new Utf8Converter()
      this.memory = memory
      this.array = new Uint8Array(memory.buffer)
    }

    writeByte(address, byte) {
      this.array[address] = byte
    }

    readByte(address) {
      return this.array[address]
    }

    readString(address) {
      let bytes = []
      let currentAddress = address
      let currentByte = this.readByte(currentAddress)
      while (currentByte !== 0) {
        bytes.push(currentByte)
        currentAddress++
        currentByte = this.readByte(currentAddress)
      }
      return this.utf8.bytesToString(bytes)
    }

    writeString(address, string) {
      let bytes = this.utf8.stringToBytes(string)
      let currentAddress = address
      bytes.forEach(byte => {
        this.writeByte(currentAddress, byte)
        currentAddress++
      })
      this.writeByte(currentAddress, 0)
    }

  }

  class ChiwasmComponent extends HTMLElement {
    constructor() {
      super()
    }

    connectedCallback() {
      console.log('connectedCallback');

      this.memory = new WebAssembly.Memory({ initial: this.fetchMemorySize() })
      this.memoryManager = new MemoryManager(this.memory)

      let path = this.fetchModulePath()
      let imports = this.fetchImports()
      this.instantiateModule(path, imports)
    }

    fetchModulePath() { return this.fetchAttribute('wasm') }
    fetchMemoryGroup() { return this.fetchAttribute('memoryGroup', 'env') }
    fetchMemoryName() { return this.fetchAttribute('memoryName', 'memory') }
    fetchMemorySize() { return Number(this.fetchAttribute('memorySize', '1')) }

    fetchAttribute(name, defaultValue) {
      let value = this.getAttribute(name)
      return value === null ? defaultValue : value
    }

    fetchImports() {
      let imports = {}

      imports[this.fetchMemoryGroup()] = imports[this.fetchMemoryGroup()] || {}
      imports[this.fetchMemoryGroup()][this.fetchMemoryName()] = this.memory

      imports.env = imports.env || {}
      imports.env.readByte = (address) => this.memoryManager.readByte(address),
      imports.env.writeByte = (address, byte) => this.memoryManager.writeByte(address, byte),
      imports.env.log = (s) => this.log(s),
      imports.env.setText = (element, value) => this.setText(element, value),
      imports.env.getText = (element, value) => this.getText(element, value),
      imports.env.addEventListener = (element, event, callback) => this.addEventListener(element, event, callback)

      return imports
    }

    instantiateModule(path, imports) {
      WebAssembly
        .instantiateStreaming(fetch(path), imports)
        .then(module => {
          this.module = module
          console.log("module loaded")
          console.log(path, "loaded", module)
        })
        .catch(error => console.log(path, "errored", error))
    }

    log(pszValue) {
      console.log(this.memoryManager.readString(pszValue))
    }

    setText(pszElementId, pszValue) {
      let elementId = this.memoryManager.readString(pszElementId)
      let value = this.memoryManager.readString(pszValue)

      document.getElementById(elementId).textContent = value
    }

    getText(pszElementId, pszValue) {
      let elementId = this.memoryManager.readString(pszElementId)
      let value = document.getElementById(elementId).textContent

      this.memoryManager.writeString(pszValue, value)
    }

    addEventListener(pszElementId, pszEvent, pfnCallback) {
      console.log("in add event listener")
      let elementId = this.memoryManager.readString(pszElementId)
      let event = this.memoryManager.readString(pszEvent)
      let element = document.getElementById(elementId)
      element.addEventListener(event, () => {
        console.log("clicked from js")
        this.module.instance.exports.table.get(pfnCallback)()
      })
    }

  }

  return { Utf8Converter, MemoryManager, ChiwasmComponent }

})()

customElements.define('x-chiwasm', Chiwasm.ChiwasmComponent)
