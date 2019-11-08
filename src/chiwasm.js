const Chiwasm = (function() {

  class Component extends HTMLElement {
    constructor() {
      super()
    }

    async connectedCallback() {
      let path = this.getAttribute('wasm')
      if (path === null) {
        console.log("attribute 'wasm' required")
      } else {
        loadModule(path)
      }
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

  function Table(wasmTable) {

    function readFunction(index) {
      return wasmTable.get(index)
    }

    function writeFunction(index, func) {
      return wasmTable.set(index, func)
    }

    return { readFunction, writeFunction }
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

  async function loadModule(path) {

    let memory, table

    let imports = {
      env : {

        log : function (pszValue) {
          console.log(memory.readString(pszValue))
        },

        setElementText : function (pszSelector, pszValue) {
          let selector = memory.readString(pszSelector)
          let value = memory.readString(pszValue)
    
          document.querySelector(selector).textContent = value
        },

        getElementText : function (pszSelector, pszValue) {
          let selector = memory.readString(pszSelector)
          let value = document.querySelector(selector).textContent
    
          memory.writeString(pszValue, value)
        },

        addEventListener : function (pszSelector, pszEvent, pfnCallback) {
          let selector = memory.readString(pszSelector)
          let element = document.querySelector(selector)
          let event = memory.readString(pszEvent)
          element.addEventListener(event, () => {
            table.readFunction(pfnCallback)()
          })
        }
      }
    }

    let wasmModule = await WebAssembly.instantiateStreaming(fetch(path), imports)
    memory = new Memory(wasmModule.instance.exports.memory)
    table = new Table(wasmModule.instance.exports.table)
    wasmModule.instance.exports.init()
  }

  return { Component, Memory, Table, Utf8Converter, loadModule }

})()

customElements.define('x-wasm', Chiwasm.Component)
