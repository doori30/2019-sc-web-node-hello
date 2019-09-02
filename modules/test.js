const firstName = "길동";
const lastName = "홍";
const fullName = () => {
		return lastName + " " + firstName;
}
module.exports = {
	firstName,
	lastName,
	fullName
}
//ES6d 에서는 변수와 값이 같으면 생략가능.
// firstName: firstName,
// 	lastName: lastName,
// 	fullName: fullName