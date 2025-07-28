const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

async function getDetail(inv_id){
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.inv_id = $1`,
      [inv_id]
    )
    return data.rows[0] // Returns first (and only) row, or undefined if not found
  } catch (error) {
    console.error("getInventoryById error " + error)
  }
}

async function registerClassification(classification_name){
  try {
    //const sql = "INSERT INTO classification (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    const realsql = "INSERT INTO classification (classification_name) VALUES ($1)"
    return await pool.query(realsql, [classification_name])
  } catch (error) {
    return error.message
  }
}


async function registerInventoryItem(inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id){
  try {
    const sql = `
  INSERT INTO inventory (
    inv_make, inv_model, inv_year, inv_description,
    inv_price, inv_miles, inv_color, classification_id
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING *
`
    //const realsql = "INSERT INTO classification (classification_name) VALUES ($1)"
    return await pool.query(sql, [
  inv_make,
  inv_model,
  inv_year,
  inv_description,
  inv_price,
  inv_miles,
  inv_color,
  classification_id,
]);
  } catch (error) {
    return error.message
  }
}


module.exports = {getClassifications, getInventoryByClassificationId, getDetail, registerClassification, registerInventoryItem}