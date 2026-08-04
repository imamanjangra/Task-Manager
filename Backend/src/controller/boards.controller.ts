import { Request, Response } from "express";
import {
  bordBody,
  bordParamsBody,
  bordUserIdBody,
  updateBoardsBody,
} from "../validators/board.validator.js";
import { pool } from "../db/index.js";
import { checkBoardPermission } from "../helpers/boardPermission.js";

export const createBoard = async (
  req: Request<bordParamsBody, {}, bordBody>,
  res: Response,
): Promise<void> => {
  try {
    const { name, description } = req.body;
    const workspace_id = req.params.workspace_id;
    const user_id = req.user?.id;

    //workspace check
    const workspace_check = await pool.query(
      "select * from workspaces where id = $1",
      [workspace_id],
    );

    if (workspace_check.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Workspace is not found ",
      });
      return;
    }

    // role check
    const role_check = await pool.query(
      `SELECT role FROM workspace_members WHERE workspace_id=$1 AND user_id=$2`,
      [workspace_id, user_id],
    );

    if (role_check.rowCount === 0) {
      res.status(403).json({
        success: false,
        message: "member not found ",
      });
      return;
    }

    const role = role_check.rows[0].role;

    if (role !== "owner" && role !== "admin") {
      res.status(403).json({
        success: false,
        message: "you can not create a Board ",
      });
      return;
    }

    const data = await pool.query(
      `insert into boards (workspace_id , name, description , created_by) values($1 , $2 , $3 , $4) RETURNING *`,
      [workspace_id, name, description, user_id],
    );

    res.status(200).json({
      success: true,
      Board: data.rows[0],
    });
    return;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      res.status(500).json({ message: error.message, stack: error.stack });
    } else {
      res.status(500).json({ error: "unknown erro" });
    }
  }
};

export const GetAllBoards = async (
  req: Request<bordParamsBody>,
  res: Response,
): Promise<void> => {
  try {
    const workspace_id = req.params.workspace_id;
    const user_id = req.user?.id;

    const workspace_check = await pool.query(
      "select id from workspaces where id = $1",
      [workspace_id],
    );

    if (workspace_check.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Workspace is not found ",
      });
      return;
    }

    const role_check = await pool.query(
      `SELECT role FROM workspace_members WHERE workspace_id=$1 AND user_id=$2`,
      [workspace_id, user_id],
    );

    if (role_check.rowCount === 0) {
      res.status(403).json({
        success: false,
        message: "member not found ",
      });
      return;
    }

    const role = role_check.rows[0].role;

    if (role !== "member" && role !== "admin" && role !== "owner") {
      res.status(403).json({
        success: false,
        message: "You have not premistion to see this Board",
      });

      return;
    }

    const data = await pool.query(
      `select * from boards where workspace_id = $1`,
      [workspace_id],
    );

    if (data.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Board not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      Boards: data.rows,
    });
    return;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      res.status(500).json({ message: error.message, stack: error.stack });
    } else {
      res.status(500).json({ error: "unknown erro" });
    }
  }
};

export const GetBoardsById = async (
  req: Request<bordUserIdBody>,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id;
    const user_id = req.user?.id;

    await checkBoardPermission(
    id,
    user_id!,
    ["owner","admin","member"]
    );

    const data = await pool.query("select * from boards where id = $1", [id]);

    res.status(200).json({
      success: true,
      Board: data.rows[0],
    });

    return;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      res.status(500).json({ message: error.message, stack: error.stack });
    } else {
      res.status(500).json({ error: "unknown erro" });
    }
  }
};

export const UpdateBoard = async (
  req: Request<bordUserIdBody, {}, updateBoardsBody>,
  res: Response,
): Promise<void> => {
  try {
    const { name, description } = req.body;
    const id = req.params.id;
    const user_id = req.user?.id;


    await checkBoardPermission(
    id,
    user_id!,
    ["owner","admin"]
);


    await pool.query(
      `
  UPDATE boards
  SET
    name = COALESCE($1, name),
    description = COALESCE($2, description)
  WHERE id = $3
  `,
      [name ?? null, description ?? null, id],
    );

    res.status(200).json({
      success: true,
      message: "Board update successfully",
    });

    return;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      res.status(500).json({ message: error.message, stack: error.stack });
    } else {
      res.status(500).json({ error: "unknown erro" });
    }
  }
};

export const deleteBoard = async (
  req: Request<bordUserIdBody>,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id;
    const user_id = req.user?.id;

  await checkBoardPermission(
    id,
    user_id!,
    ["owner","admin"]
);

    await pool.query(`delete from boards where id = $1`, [id]);

    res.status(200).json({
        success : true,
        message : "board deleted "
    })
    return;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      res.status(500).json({ message: error.message, stack: error.stack });
    } else {
      res.status(500).json({ error: "unknown error" });
    }
  }
};
