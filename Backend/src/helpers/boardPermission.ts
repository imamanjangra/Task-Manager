import { pool } from "../db/index.js";

export const checkBoardPermission = async (
  board_id: string,
  user_id: string,
  allowedRoles: string[]
) => {

  // Check board exists
  const boardResult = await pool.query(
    `SELECT workspace_id
     FROM boards
     WHERE id = $1`,
    [board_id]
  );

  if (boardResult.rowCount === 0) {
    throw new Error("Board not found");
  }

  const workspace_id = boardResult.rows[0].workspace_id;

  // Check member
  const memberResult = await pool.query(
    `
    SELECT role
    FROM workspace_members
    WHERE workspace_id=$1
    AND user_id=$2
    `,
    [workspace_id, user_id]
  );

  if (memberResult.rowCount === 0) {
    throw new Error("You are not a member of this workspace");
  }

  const role = memberResult.rows[0].role;

  if (!allowedRoles.includes(role)) {
    throw new Error("Permission denied");
  }

  return {
    workspace_id,
    role
  };
};