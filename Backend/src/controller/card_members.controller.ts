import { Request, Response } from "express";
import { checkCardPermission } from "../helpers/cardPremission.js";
import { card_user_id_Body, CardBody, ListIdBody } from "../validators/card_member.validator.js";
import { pool } from "../db/index.js";


export const AssignMember = async(req : Request<ListIdBody , {} , CardBody> , res : Response):Promise<void> => {
    try {
        const card_id = req.params.card_id;
        const assigned_by = req.user?.id;

        const {user_id}  = req.body;

         await checkCardPermission(
            card_id,
            assigned_by!,
        );

        const check = await pool.query<card_user_id_Body>(
            `
            SELECT *
            FROM card_members
            WHERE card_id=$1
            AND user_id=$2
            `,
            [card_id, user_id]
        );

        if((check.rowCount ?? 0) > 0){
         res.status(400).json({
            success:false,
            message:"Member already assigned"
        });
        return;
        }

        const data = await pool.query(`insert into card_members (card_id , assigned_by , user_id) values($1 , $2 , $3) RETURNING *` , [card_id , assigned_by , user_id]);

        res.status(200).json({
            success : true,
            card_member : data.rows[0]
        })
        return;

    } catch (error) {
         if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
    }
}

export const RemoveMember = async(req : Request<ListIdBody> , res : Response):Promise<void> => {
    try {
        const id = req.params. card_id;
        const user_id = req.user?.id;

        const card = await pool.query(`select * from card_members where id = $1` , [id]);

        if(card.rowCount === 0){
            res.status(403).json({
                success : false,
                message : "card not found"
        })
        return;
    }

        const card_id = card.rows[0].card_id;
        
         await checkCardPermission(
            card_id,
            user_id!,
        );

        await pool.query(`delete from card_members where id=$1` , [id])

        res.status(200).json({
            success : true,
            message : "remove member"
        })

    } catch (error) {
          if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
    }
}

export const AssignedMember = async (req : Request<ListIdBody> , res : Response):Promise<void> => {
    try {
    const card_id = req.params.card_id;
    const user_id = req.user?.id;
        
     await checkCardPermission(
            card_id,
            user_id!,
        );

    const data = await pool.query(`select * from card_members where card_id = $1` , [card_id])

    res.status(200).json({
        success : true,
        card_members : data.rows
    })
    return;

    } catch (error) {
          if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    } 
    }
}