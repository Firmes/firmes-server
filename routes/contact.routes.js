const express = require("express");
const router = express.Router();
const pool = require('../db/index');
const hubspot = require('@hubspot/api-client')
const hubspotClient = new hubspot.Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN })

router.post('/save-contact-details', async (req, res) => {
    try {
        const { user_firstname, user_lastname, user_email, message_subject, message_text } = req.body;

        if(!user_email || !message_subject || !message_text) return res.status(400).json({errorMessage: 'Please, fill all the required fields'})
        
        const validateEmailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;

        if (!validateEmailRegex.test(user_email)) return res.status(400).json({ errorMessage: 'It seems there is a mistake on the email.' });

        const checkIfUserExists = await pool.query(`SELECT * FROM  firmes.user_contact_info WHERE user_email = '${user_email}'`);

        if (checkIfUserExists.rows.length > 0) return res.status(400).json({ errorMessage: "You already sent a message. You'll get a response soon." });

        await pool.query(`INSERT INTO firmes.user_contact_info (user_firstname, user_lastname, user_email, message_subject, message_text) VALUES ($1, $2, $3, $4, $5)`, [user_firstname, user_lastname, user_email, message_subject, message_text]);

        return res.status(200).json({ message: 'Info saved!' })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ errorMessage: 'We are experiencing an internal error. Try later please.' })
    }
});

router.get('/all-contacts', async (req, res) => {
    try {
        const { rows } = await pool.query(`SELECT * FROM firmes.user_contact_info`);
        return res.status(200).send(rows)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ errorMessage: 'We are experiencing an internal error. Try later please.' })
    }
});

router.get('/contact-info/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query(`SELECT * FROM  firmes.user_contact_info WHERE id = ${id}`);

        if (!rows.length > 0) return res.status(400).json({ errorMessage: "The given id doesn't exist" });

        const [contactDetails] = rows

        return res.status(200).send(contactDetails)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ errorMessage: 'We are experiencing an internal error. Try later please.' })
    }
})

router.post('/save-contact-hubspot', (req, res, next) => {
    const { firstname, lastname, email, message_web } = req.body;

    const contactObj = {
        properties: {
            firstname,
            lastname,
            email,
            mensaje_web_: message_web
        }
    };

    hubspotClient.crm.contacts.basicApi
        .create(contactObj)
        .then(response => res.status(200).send(response))
        .catch(() => res.status(500).json({ errorMessage: 'We are experiencing an internal error. Try later please.' }));
})

module.exports = router;