export const validateUserData = (req, res, next) => {
	const { name, email, gender, age } = req.body
	console.log(typeof age, "running the check")
	// empty check
	// if ((!name || !email, !gender, !age)) {
	// 	return res
	// 		.status(400)
	// 		.json({ error: "Name, email, gender, and age are required" })
	// }
	// // check type
	// if (typeof name !== "string" || typeof email !== "string") {
	// 	return res.status(400).json({ error: "Name and email must be strings" })
	// }
	// if (typeof gender !== "string") {
	// 	return res.status(400).json({ error: "Gender must be a string" })
	// }
	// if (typeof age !== "number") {
	// 	return res.status(400).json({ error: "Age must be a number" })
	// }
	//next()
	return res.status(400).json({ error: "no no no no no " })
}
