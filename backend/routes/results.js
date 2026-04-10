const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const catchAsync = require('../utils/catchAsync');
const getFileUrl = require('../utils/fileUrl');

// GET /api/results/competition/:competitionId
router.get('/competition/:competitionId', catchAsync(async (req, res) => {
    const { competitionId } = req.params;
    
    const result = await pool.query(`
        SELECT 
            r.id,
            p.familia || ' ' || p.name || ' ' || p.otchestvo as "fullName",
            d.name as degree,
            r.diploma_path as "diplomaPath"
        FROM results r
        JOIN profiles p ON p.id = r.student_id
        JOIN degrees d ON d.id = r.degree_id
        WHERE r.competition_id = $1
        ORDER BY d.id ASC
    `, [competitionId]);
    
    const rows = result.rows.map(row => ({
        id: row.id,
        fullName: row.fullName,
        degree: row.degree,
        diplomaLink: getFileUrl(row.diplomaPath)
    }));
    
    res.json(rows);
}));

module.exports = router;