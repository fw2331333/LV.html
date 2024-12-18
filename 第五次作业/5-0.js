const person = {
    name: '佐科姐姐',
    age: 1000000,
    address: {
      city: 'ChongQing',
      area: 'NanShan'
    },
    title: ['student',{year:2022, title:'GoodStudent'}]
  }
  const {age : year} = person;
  const {name} = person;
  const {address :{city}} = person;
  const {address : {area:mountain}} = person;
  const {title :[title1,{title:title2}]} = person;
  // 你的代码
  console.log(name); // 佐科姐姐
  console.log(year); // 1000000 这里没有写错哈，就是要输出1000000，结合课件
  console.log(city) ;// ChongQing
  console.log(mountain); // NanShan //这里没有写错，就是要输出NanShan，结合课件
  console.log(title1); // student
  console.log(title2) ;// GoodStudent