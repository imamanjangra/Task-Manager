import { Request, Response } from "express";
import { pool } from "../db/index.js";
import { checkBoardPermission } from "../helpers/boardPermission.js";
import {
  CardBody,
  UpdateCardBody,
  ListIdBody,
  CardIdBody,
} from "../validators/card.validator.js";

export const createCard = async (
  req: Request<ListIdBody, {}, CardBody>,
  res: Response
): Promise<void> => {
  try {
    const { title, description, assigned_to, due_date } = req.body;

    const list_id = req.params.list_id;
    const user_id = req.user?.id;

    const list = await pool.query(
      "SELECT board_id FROM lists WHERE id=$1",
      [list_id]
    );

    if (list.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "List not found",
      });
      return;
    }

    const board_id = list.rows[0].board_id;

    await checkBoardPermission(
      board_id,
      user_id!,
      ["owner", "admin", "member"]
    );

    const data = await pool.query(
      `
      INSERT INTO cards
      (list_id,title,description,created_by,assigned_to,due_date)
      VALUES($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [
        list_id,
        title,
        description ?? null,
        user_id,
        assigned_to ?? null,
        due_date ?? null,
      ]
    );

    res.status(201).json({
      success: true,
      Card: data.rows[0],
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};


export const getAllCards = async (
  req: Request<ListIdBody>,
  res: Response
): Promise<void> => {
  try {
    const list_id = req.params.list_id;
    const user_id = req.user?.id;

    const list = await pool.query(
      "SELECT board_id FROM lists WHERE id=$1",
      [list_id]
    );

    if (list.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "List not found",
      });
      return;
    }

    const board_id = list.rows[0].board_id;

    await checkBoardPermission(
      board_id,
      user_id!,
      ["owner", "admin", "member"]
    );

    const cards = await pool.query(
      "SELECT * FROM cards WHERE list_id=$1 ORDER BY created_at ASC",
      [list_id]
    );

    res.status(200).json({
      success: true,
      Cards: cards.rows,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};


export const getCardById = async (
  req: Request<CardIdBody>,
  res: Response
): Promise<void> => {
  try {
    const card_id = req.params.card_id;
    const user_id = req.user?.id;

    const card = await pool.query(
      `
      SELECT c.*,l.board_id
      FROM cards c
      JOIN lists l
      ON c.list_id=l.id
      WHERE c.id=$1
      `,
      [card_id]
    );

    if (card.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Card not found",
      });
      return;
    }

    await checkBoardPermission(
      card.rows[0].board_id,
      user_id!,
      ["owner", "admin", "member"]
    );

    res.status(200).json({
      success: true,
      Card: card.rows[0],
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};

export const updateCard = async (
  req: Request<CardIdBody, {}, UpdateCardBody>,
  res: Response
): Promise<void> => {
  try {
    const card_id = req.params.card_id;
    const user_id = req.user?.id;

    const { title, description, assigned_to, due_date } = req.body;

    const card = await pool.query(
      `
      SELECT c.*,l.board_id
      FROM cards c
      JOIN lists l
      ON c.list_id=l.id
      WHERE c.id=$1
      `,
      [card_id]
    );

    if (card.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Card not found",
      });
      return;
    }

    await checkBoardPermission(
      card.rows[0].board_id,
      user_id!,
      ["owner", "admin", "member"]
    );

    const data = await pool.query(
      `
      UPDATE cards
      SET
      title=COALESCE($1,title),
      description=COALESCE($2,description),
      assigned_to=COALESCE($3,assigned_to),
      due_date=COALESCE($4,due_date),
      updated_at=NOW()
      WHERE id=$5
      RETURNING *
      `,
      [
        title ?? null,
        description ?? null,
        assigned_to ?? null,
        due_date ?? null,
        card_id,
      ]
    );

    res.status(200).json({
      success: true,
      Card: data.rows[0],
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};


export const deleteCard = async (
  req: Request<CardIdBody>,
  res: Response
): Promise<void> => {
  try {
    const card_id = req.params.card_id;
    const user_id = req.user?.id;

    const card = await pool.query(
      `
      SELECT c.*,l.board_id
      FROM cards c
      JOIN lists l
      ON c.list_id=l.id
      WHERE c.id=$1
      `,
      [card_id]
    );

    if (card.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Card not found",
      });
      return;
    }

    await checkBoardPermission(
      card.rows[0].board_id,
      user_id!,
      ["owner", "admin", "member"]
    );

    await pool.query(
      "DELETE FROM cards WHERE id=$1",
      [card_id]
    );

    res.status(200).json({
      success: true,
      message: "Card deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};