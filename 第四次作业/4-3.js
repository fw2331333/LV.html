var a = {n:1}//创建对象{n:1}，赋值给a
var b = a
a.x = a = {n:2}//.的运算优先级高于=

console.log(a)//{n:2}
console.log(b)//{n:1,x:{n:2}}
a.n = 3
console.log(b)//{n:1,x:{n:2}}