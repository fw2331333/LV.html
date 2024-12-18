// 定义一个深拷贝函数deepCopy，一个参数obj，表示要进行深拷贝的对象
function deepCopy(obj) {
    // 首先判断传入的参数obj，如果它不是对象类型（或者为null），说明是基本数据类型，直接返回该值
    if (typeof obj!= 'object' || obj == null) {
        return obj;
    }

    // 用于存储深拷贝后的结果对象
    let sb;

    // 如果obj是数组类型
    if (Array.isArray(obj)) {
        // 创建一个新的空数组作为深拷贝后的结果数组
        sb = [];
        // 遍历原数组obj，对数组中的每个元素递归调用deepCopy函数进行拷贝
        for (let i = 0; i < obj.length; i++) {
            sb[i] = deepCopy(obj[i]);
        }
    } 
    else {
    // 如果obj是普通对象类型，创建一个新的空对象作为深拷贝后的结果对象
        sb = {};
        // 通过for...in循环遍历原对象obj的属性，并且只拷贝对象自身的属性（通过obj.hasOwnProperty(key)判断）
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                // 对于每个属性值同样递归调用deepCopy函数进行拷贝，将拷贝后的属性值放入新对象sb中
                sb[key] = deepCopy(obj[key]);
            }
        }
    }

    // 返回深拷贝后的结果对象
    return sb;
}

// 定义一个复杂对象complexObj，包含基本数据类型属性、嵌套的对象属性以及null值属性等，用于测试深拷贝函数
const complexObj = {
    name: '王五',
    age: 30,
    info: {
        address: '北京',
        hobbies: ['玩原神', '敲代码']
    },
    friend: null
};

// 使用深拷贝函数deepCopy对complexObj进行深拷贝，得到一个newComplexObj
const newComplexObj = deepCopy(complexObj);

// 修改newComplexObj的属性值
newComplexObj.name = '赵六';
newComplexObj.age = 99;
newComplexObj.info.hobbies.push('玩代码');

// 输出原始复杂对象complexObj，查看经过对newComplexObj操作后，complexObj是否受到影响
console.log('complexObj:', complexObj);

// 输出深拷贝后的复杂对象newComplexObj，查看修改后的newComplexObj的具体情况
console.log('newComplexObj:', newComplexObj);
