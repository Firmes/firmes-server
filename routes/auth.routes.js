const express = require("express");
const router = express.Router();
const pool = require('../db/index');

// // ℹ️ Handles password encryption
const bcrypt = require("bcrypt");
const saltRounds = 10;

router.post("/signup", async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ errorMessage: "Provide email and password." });
            return;
        }

        const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
        if (!passwordRegex.test(password)) {
            res.status(400).json({
                errorMessage:
                    "Password must have at least 8 characters and contain at least one number, one lowercase and one uppercase letter.",
            });
            return;
        }

        const { rows } = await pool.query(`SELECT FROM firmes.admin_user WHERE username = '${username}'`);
        const [theUser] = rows;

        if (theUser) return res.status(400).json({ errorMessage: "The user already exists" });

        const salt = bcrypt.genSaltSync(saltRounds);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const saveUser = await pool.query(`INSERT INTO firmes.admin_user (username, password) VALUES ($1, $2) RETURNING *`, [username, hashedPassword]);
        const userSaved = saveUser.rows[0];
        if (userSaved) {
            const { username, id } = userSaved;
            const userToSend = { username, id }
            return res.status(200).send(userToSend);
        } else {
            return res.status(401).json({ errorMessage: "Unable to authenticate the user" });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({ errorMessage: 'An internal error just occurred' });
    }

});

// // POST  /auth/login - Verifies email and password 
router.post("/login", async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Check if email or password are provided as empty string
        if (!username || !password) {
            res.status(400).json({ errorMessage: "Provide email and password." });
            return;
        }

        const { rows } = await pool.query(`SELECT * FROM firmes.admin_user WHERE username = '${username}'`);
        const [theUser] = rows;

        if (!theUser) return res.status(401).json({ errorMessage: "User not found." });

        const passwordCorrect = bcrypt.compareSync(password, theUser.password);

        if (passwordCorrect) {
            const { username, id } = theUser;
            const userLogged = { username, id };
            return res.status(200).send(userLogged);
        } else {
            return res.status(401).json({ errorMessage: "Unable to authenticate the user" });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({ errorMessage: 'An internal error just occurred' });
    }
});

// // GET  /auth/verify  -  Used to verify JWT stored on the client
// router.get("/verify", isAuthenticated, (req, res, next) => {
//   // If JWT token is valid the payload gets decoded by the
//   // isAuthenticated middleware and is made available on `req.payload`
//   console.log(`req.payload`, req.payload);

//   // Send back the token payload object containing the user data
//   res.status(200).json(req.payload);
// });

module.exports = router;
