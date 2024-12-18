let arr = [1,[2,3],[4,5,[6,7,8]],9];
function flatten(arr) {
    //你的代码
    let arrr =[]
    arr.map((value)=>{
        if(Array.isArray(value)){
            arrr=arrr.concat(flatten(value))
        }
        else{
            arrr.push(value)
        }
    })
    return arrr
}
console.log(flatten(arr));
//结果 [1,2,3,4,5,6,7,8,9]