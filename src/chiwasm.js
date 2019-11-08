const Chiwasm = (function() {

  class Component extends HTMLElement {
    constructor() {
      super()
    }

    async connectedCallback() {
      this.module = new Module(this.modulePath)
    }

    get modulePath() {
      return this.fetchAttribute('wasm')
    }

    fetchAttribute(name, defaultValue) {
      let value = this.getAttribute(name)
      return value === null ? defaultValue : value
    }

  }

  function Module(path) {

    let imports = {
      env : {
        log,
        setElementText,
        getElementText,
        addEventListener
      }
    }

    let wasmModule, memory

    (async () => {
      wasmModule = await WebAssembly.instantiateStreaming(fetch(path), imports)
      memory = new Memory(wasmModule.instance.exports.memory)
      wasmModule.instance.exports.init()
    })()

    function log(pszValue) {
      console.log(memory.readString(pszValue))
    }

    function setElementText(pszSelector, pszValue) {
      let selector = memory.readString(pszSelector)
      let value = memory.readString(pszValue)

      document.querySelector(selector).textContent = value
    }

    function getElementText(pszSelector, pszValue) {
      let selector = memory.readString(pszSelector)
      let value = document.querySelector(selector).textContent

      memory.writeString(pszValue, value)
    }

    function addEventListener(pszSelector, pszEvent, pfnCallback) {
      console.log("in add event listener")
      console.log("memory", memory)
      console.log("module", wasmModule)
      let selector = memory.readString(pszSelector)
      let element = document.querySelector(selector)
      let event = memory.readString(pszEvent)
      element.addEventListener(event, () => {
        console.log("clicked from js")
        wasmModule.instance.exports.table.get(pfnCallback)()
      })
    }

  }

  function Memory(wasmMemory) {
    let utf8 = new Utf8Converter()
    let array = new Uint8Array(wasmMemory.buffer)

    function writeByte(address, byte) {
      array[address] = byte
    }

    function readByte(address) {
      return array[address]
    }

    function readString(address) {
      let bytes = []
      let currentAddress = address
      let currentByte = readByte(currentAddress)
      while (currentByte !== 0) {
        bytes.push(currentByte)
        currentAddress++
        currentByte = readByte(currentAddress)
      }
      return utf8.bytesToString(bytes)
    }

    function writeString(address, string) {
      let bytes = utf8.stringToBytes(string)
      let currentAddress = address
      bytes.forEach(byte => {
        writeByte(currentAddress, byte)
        currentAddress++
      })
      writeByte(currentAddress, 0)
    }

    return { readByte, writeByte, readString, writeString }
  }

  function Utf8Converter() {

    let decoder = new TextDecoder("utf8")
    let encoder = new TextEncoder()

    function bytesToString(bytes) {
      let index = bytes.indexOf(0)
      let array = index === -1 ? bytes : bytes.slice(0, index)
      return decoder.decode(new Uint8Array(array))
    }

    function stringToBytes(string) {
      let array = Array.from(encoder.encode(string))
      array.push(0)
      return new Uint8Array(array)
    }

    return { bytesToString, stringToBytes }
  }

  return { Utf8Converter, Memory, Component }

})()

customElements.define('x-chiwasm', Chiwasm.Component)
