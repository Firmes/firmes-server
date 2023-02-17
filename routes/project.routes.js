const pool = require('../db/index');
const uploader = require('../config/cloudinary.config');
const express = require("express");
const router = express.Router();

router.get('/get-all-projects', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM view');
        return res.status(200).send(rows);
    } catch (error) {
        console.log(error)
        return res.status(400).json({errorMessage: 'An internal error just occurred'});
    }
});

router.get('/get-single-project', async (req, res) => {
    try {
        const { project_id } = req.body;
        const { rows } = await pool.query(`SELECT * FROM view WHERE project_id = ${project_id}`);
        const [projectInfo] = rows;
        return res.status(200).send(projectInfo);
    } catch (error) {
        console.log(error)
        return res.status(400).json({errorMessage: 'An internal error just occurred'});
    }
});

router.post('/create-new-project', async (req, res) => {
    try {
        const { title, client, description, creation_year, video_url, type, images } = req.body;
        const project_info = await pool
            .query(`INSERT INTO project_info (project_title, project_client, project_description, project_creation_year, project_video_url, project_type) RETURNING *`, [title, client, description, creation_year, video_url, type]);

        // for (let imageInfo of images ) {
        //     await pool
        //         .query(`INSERT INTO table_name VALUES ()`, [])
        // }

        return res.status(200).send(project_info.rows[0]);
    } catch (error) {
        console.log(error)
        return res.status(400).json({errorMessage: 'An internal error just occurred'});
    }
});

router.put('/edit-project', async (req, res) => {
    try {
        const { title, client, description, creation_year, video_url, type, images, project_id } = req.body;
        const project_info = await pool
            .query(`UPDATE table_name SET () WHERE project_id = ${project_id} RETURNING *`, [title, client, description, creation_year, video_url, type]);
            
    } catch (error) {
        console.log(error)
        return res.status(400).json({errorMessage: 'An internal error just occurred'});
    }
});

router.delete('/delete-project', (req, res) => {
    try {
        
    } catch (error) {
        console.log(error)
        return res.status(400).json({errorMessage: 'An internal error just occurred'});
    }
});

router.post('/upload-image', uploader.single('imageUrl'), (req, res) => {
    try {
        if (!req.file) {
          res.status(400).json({ errorMessage: 'Please upload an image' });
          return;
        }
      
        return res.status(200).json({ imageUrl: req.file.path });
        
    } catch (error) {
        console.log(error)
        return res.status(400).json({errorMessage: 'An internal error just occurred'});
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
          return res.status(400).json({errorMessage: 'An internal error just occurred'});
      }
  });

  router.delete('/delete-image', (req, res) => {
      try {
          
      } catch (error) {
          console.log(error)
          return res.status(400).json({errorMessage: 'An internal error just occurred'});
      }
  });

  module.exports = router;