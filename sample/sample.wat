(module

  (import "env" "log" (func $log (param i32)))
  (import "env" "setElementText" (func $setText (param i32) (param i32)))
  (import "env" "getElementText" (func $getText (param i32) (param i32)))
  (import "env" "addEventListener" (func $addEventListener (param i32) (param i32) (param i32)))

  (memory $memory 1)

  (data (i32.const 0) "fizz\00buzz\00✈️\00")
  (data (i32.const 20) "#theElement\00")
  (data (i32.const 40) "#theOtherElement\00")
  (data (i32.const 80) "clicked!\00")
  (data (i32.const 100) "#aButton\00")
  (data (i32.const 110) "click\00")

  (table $table 1 anyfunc)
  
  (elem (i32.const 0) $onClick)

  (func $init
    (call $addEventListener (i32.const 100) (i32.const 110) (i32.const 0))
    (call $log (i32.const 0))
    (call $log (i32.const 5))
    (call $log (i32.const 10))
    (call $setText (i32.const 20) (i32.const 0))
    (call $getText (i32.const 40) (i32.const 60))
    (call $log (i32.const 60))
  )

  (func $onClick
    (call $log (i32.const 80))
    (call $setText (i32.const 40) (i32.const 80))
  )

  (export "memory" (memory $memory))
  (export "table" (table $table))

  (export "init" (func $init))

)
