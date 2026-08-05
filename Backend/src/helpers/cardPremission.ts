

import { pool } from "../db/index.js";
import { checkBoardPermission } from "./boardPermission.js";

export const checkCardPermission = async (
  card_id: string,
  user_id: string,
) => {

  const cardResult = await pool.query(
    `SELECT *
     FROM cards
     WHERE id = $1`,
    [card_id]
  );

  if (cardResult.rowCount === 0) {
    throw new Error("card not found");
  }
  

  const board_id  = cardResult.rows[0].board_id; 

   await checkBoardPermission(
      board_id,
      user_id!,
      ["owner", "admin", "member"]
    );

    

};