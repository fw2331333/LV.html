// 浅拷贝,使用Object.assign()
// 定义一个名为obj1的对象，包含name、age和hobbies三个属性
const obj1 = {
    name: '张三',
    age: 20,
    hobbies: ['玩原神', '敲代码']
};

// 使用Object.assign()方法进行浅拷贝，创建一个新的对象obj2
// 第一个参数{}表示创建一个新的空对象作为目标对象，第二个参数obj1表示将obj1的属性复制到新创建的空对象中
const obj2 = Object.assign({}, obj1);

// 修改obj2的name属性值，将其从'张三'修改为'李四'
// 由于name是基本数据类型，浅拷贝后obj2的name属性与obj1的name属性是相互独立的，修改obj2的该属性不会影响obj1的name属性
obj2.name = '李四';

// 向obj2的hobbies数组中添加一个新元素'游泳'
// 因为hobbies是引用数据类型，浅拷贝只是复制了引用地址，所以obj2和obj1的hobbies属性指向的是同一个数组对象
// 对obj2的hobbies数组进行操作，会影响到obj1的hobbies数组
obj2.hobbies.push('玩代码');
// 输出obj1对象的内容
console.log('obj1:', obj1);
// 输出obj2对象的内容
console.log('obj2:', obj2);
