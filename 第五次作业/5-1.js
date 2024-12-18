function factorial(n) {
    if (n == 0) {
        return 1;
    }
    return n * factorial(n - 1);
}
console.log(factorial(4));//24

function factorial1(n) {
    let result = 1;
    for (let i = 1; i <= n; i++) {
        result *= i;
    }
    return result;
}
console.log(factorial1(5));//120


