const pool = require('../db/index');
const uploader = require('../config/cloudinary.config');
const express = require("express");
const router = express.Router();
const { getTypeId } = require('../utils/utils');

router.get('/get-all-projects', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM firmes.project_info');
        const allProjectsData = [];
        for (let projectInfo of rows) {
            const projectImages = await pool.query(`SELECT * FROM firmes.project_image_url WHERE project_info_id_fk = ${projectInfo.project_info_id}`);
            const projectTypeRows = await pool.query(`SELECT project_type_description FROM firmes.project_type WHERE project_type_id = ${projectInfo.project_type}`)
            const projectWithImages = {
                ...projectInfo,
                projectType: projectTypeRows.rows[0].project_type_description,
                project_images: projectImages.rows
            };
            allProjectsData.push(projectWithImages);
        }

        return res.status(200).send(allProjectsData);
    } catch (error) {
        console.log(error)
        return res.status(400).json({ errorMessage: 'An internal error just occurred' });
    }
});

router.get('/get-single-project/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const { rows } = await pool.query(`SELECT * FROM firmes.project_info WHERE project_info_id = ${projectId}`);
        const [projectInfo] = rows;
        const projectTypeRows = await pool.query(`SELECT project_type_description FROM firmes.project_type WHERE project_type_id = ${projectInfo.project_type}`)
        const projectImages = await pool.query(`SELECT * FROM firmes.project_image_url WHERE project_info_id_fk = ${projectId}`);
        const projectData = {
            ...projectInfo,
            projectType: projectTypeRows.rows[0].project_type_description,
            project_images: projectImages.rows
        }

        return res.status(200).send(projectData);
    } catch (error) {
        console.log(error)
        return res.status(400).json({ errorMessage: 'An internal error just occurred' });
    }
});

router.post('/create-new-project', async (req, res) => {
    try {
        const { project_title, project_client, project_description, project_year, project_videoURL, project_type } = req.body.projectDetails;
        const { projectImages } = req.body;

        const projectTypeId = await getTypeId(project_type, pool);
        const project_info = await pool
            .query(`INSERT INTO firmes.project_info (project_title, project_client, project_description, project_creation_year, project_video_url, project_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [project_title, project_client, project_description, Number(project_year), project_videoURL, projectTypeId]);

        for (let imageInfo of projectImages) {
            await pool
                .query(`INSERT INTO firmes.project_image_url (project_info_id_fk, project_image_url, image_is_portrait) VALUES ($1, $2, $3)`, [project_info.rows[0].project_info_id, imageInfo.project_image_url, imageInfo.image_is_portrait]);
        }

        return res.status(200).send(project_info.rows[0]);

    } catch (error) {
        console.log(error)
        return res.status(400).json({ errorMessage: 'An internal error just occurred' });
    }
});

router.put('/edit-project/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const { project_title, project_client, project_description, project_year, project_videoURL, project_type } = req.body.projectDetails;
        const { projectImages } = req.body;
        const projectTypeId = await getTypeId(project_type, pool);

        //Check project type, add existing type check?, all the other values are saved correctly
        const project_info = await pool
            .query(`UPDATE firmes.project_info SET project_title = '${project_title}', project_client = '${project_client}', project_description = '${project_description}', project_creation_year = ${Number(project_year)}, project_video_url = '${project_videoURL}', project_type = ${projectTypeId} WHERE project_info_id = ${projectId} RETURNING *`);

        for (let imageInfo of projectImages) {

            if (imageInfo.image_id) {
                await pool
                    .query(`UPDATE firmes.project_image_url SET project_info_id_fk = ${project_info.rows[0].project_info_id}, project_image_url = '${imageInfo.project_image_url}', image_is_portrait = ${imageInfo.image_is_portrait} WHERE image_id = ${imageInfo.image_id}`);
            } else {
                await pool
                    .query(`INSERT INTO firmes.project_image_url (project_info_id_fk, project_image_url, image_is_portrait) VALUES ($1, $2, $3)`, [project_info.rows[0].project_info_id, imageInfo.project_image_url, imageInfo.image_is_portrait]);
            }
        }

        return res.status(200).json({ message: 'Project updated' });

    } catch (error) {
        console.log(error)
        return res.status(400).json({ errorMessage: 'An internal error just occurred' });
    }
});

router.delete('/delete-project/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const query = await pool.query(`DELETE FROM firmes.project_info WHERE project_info_id = ${projectId}`);
        res.status(200).json({ message: 'Project deleted' });
    } catch (error) {
        console.log(error)
        return res.status(400).json({ errorMessage: 'An internal error just occurred' });
    }
});

router.post('/upload-image', uploader.single('project_image_url'), (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ errorMessage: 'Please upload an image' });
            return;
        }

        return res.status(200).json({ project_image_url: req.file.path });

    } catch (error) {
        console.log(error)
        return res.status(400).json({ errorMessage: 'An internal error just occurred' });
    }
});

router.delete('/delete-image/:imageId', async (req, res) => {
    try {
        const { imageId } = req.params;
        const query = await pool.query(`DELETE FROM firmes.project_image_url WHERE image_id = ${imageId}`);
        res.status(200).json({ message: 'Image deleted' });
    } catch (error) {
        console.log(error)
        return res.status(400).json({ errorMessage: 'An internal error just occurred' });
    }
});

router.post('/link-image-on-project', (req, res) => {
    try {
        const { imageUrl, project_id, image_dimension } = req.body;
        pool
            .query('INSERT INTO project_image_url VALUES (project_info_id, project_image_url)', [project_id, imageUrl])
    } catch (error) {

    }
});

router.put('/update-image', (req, res) => {
    try {

    } catch (error) {
        console.log(error)
        return res.status(400).json({ errorMessage: 'An internal error just occurred' });
    }
});

router.delete('/delete-image', async (req, res) => {
    try {
        const { image_id } = req.body;
        const query = await pool.query(`DELETE FROM table WHERE image_id = ${image_id}`);
        res.status(200).json({ message: 'Image deleted' });
    } catch (error) {
        console.log(error)
        return res.status(400).json({ errorMessage: 'An internal error just occurred' });
    }
});

module.exports = router;