const getTypeId = async (type, pool) => {
    const cleanType = type.toLowerCase().trim();
    const { rows } = await pool.query(`SELECT * FROM firmes.project_type WHERE project_type_description = '${cleanType}'`);

    if ( rows.length > 0 ) return rows[0].project_type_id;

    const createType = await pool.query(`INSERT INTO firmes.project_type (project_type_description) VALUES ($1) RETURNING *`, [cleanType]);
    return createType.rows[0].project_type_id;
};

module.exports = { getTypeId };