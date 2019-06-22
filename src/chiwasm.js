const Chiwasm = (function() {

  class Component extends HTMLElement {
    constructor() {
      super()
    }

    connectedCallback() {
      let size = this.memorySize
      let group = this.memoryGroup
      let name = this.memoryName
      let path = this.modulePath

      let memory = new Memory(size, group, name)
      this.module = new Module(path, memory)
    }

    get modulePath() {
      return this.fetchAttribute('wasm')
    }

    get memoryGroup() {
      return this.fetchAttribute('memoryGroup', 'env')
    }

    get memoryName() {
      return this.fetchAttribute('memoryName', 'memory')
    }

    get memorySize() {
      return Number(this.fetchAttribute('memorySize', '1'))
    }

    fetchAttribute(name, defaultValue) {
      let value = this.getAttribute(name)
      return value === null ? defaultValue : value
    }

  }

  class Memory {
    constructor(size, group, name) {
      this.group = group
      this.name = name

      this.utf8 = new Utf8Converter()
      this.memory = new WebAssembly.Memory({ initial: size })
      this.array = new Uint8Array(this.memory.buffer)
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

    addToImports(imports) {
      imports[this.group] = imports[this.group] || {}
      imports[this.group][this.name] = this.memory
      return imports
    }

  }

  class Module {
    constructor(path, memory) {
      this.memory = memory
      this.instantiateModule(path, this.fetchImports())
    }

    fetchImports() {
      let imports = {}

      imports = this.memory.addToImports(imports)

      imports.env = imports.env || {}
      imports.env.log = (s) => this.log(s)
      imports.env.setElementTextById = (id, value) => this.setElementTextById(id, value)
      imports.env.getElementTextById = (id, value) => this.getElementTextById(id, value)
      imports.env.addEventListenerForId = (id, event, callback) => this.addEventListenerForId(id, event, callback)

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
      console.log(this.memory.readString(pszValue))
    }

    setElementTextById(pszElementId, pszValue) {
      let elementId = this.memory.readString(pszElementId)
      let value = this.memory.readString(pszValue)

      document.getElementById(elementId).textContent = value
    }

    getElementTextById(pszElementId, pszValue) {
      let elementId = this.memory.readString(pszElementId)
      let value = document.getElementById(elementId).textContent

      this.memory.writeString(pszValue, value)
    }

    addEventListenerForId(pszElementId, pszEvent, pfnCallback) {
      console.log("in add event listener")
      let elementId = this.memory.readString(pszElementId)
      let event = this.memory.readString(pszEvent)
      let element = document.getElementById(elementId)
      element.addEventListener(event, () => {
        console.log("clicked from js")
        this.module.instance.exports.table.get(pfnCallback)()
      })
    }

  }

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

  return { Utf8Converter, Memory, Component }

})()

customElements.define('x-chiwasm', Chiwasm.Component)
