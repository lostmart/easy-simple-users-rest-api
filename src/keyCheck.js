const { API_KEY } = process.env

export const checkKey = (req, res, next) => {
	const { my_key } = req.headers
	if (my_key !== API_KEY) {
		return res.status(401).json({ error: "Unauthorized" })
	}

	next()
}
