let obj = new Object();
obj.name = 'sb';
obj.age = '20';
console.log(obj); 

let obj1 = {
    name1: 'sbb',
    age1: '30'
}
console.log(obj1); 

function Person(name, age) {
    this.name = name
    this.age  = age
    this.sayname = () => {
      console.log(this.name)
    }
  }
  const p1 = new Person('sbbb', 40)
  const p2 = new Person('sbbbb', 50)
  console.log(p1,p2);