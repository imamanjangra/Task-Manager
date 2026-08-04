import { Request, Response } from "express";
import { pool } from "../db/index.js";
import { checkBoardPermission } from "../helpers/boardPermission.js";
import { board_idBody, ListBody, listId_Body } from "../validators/list.validator.js";


export const createList = async (req : Request<board_idBody , {} , ListBody> , res : Response):Promise<void> => {
    try {
        const {name} = req.body
        const board_id = req.params.board_id;
        const user_id = req.user?.id;
        
         await checkBoardPermission(
            board_id,
            user_id!,
            ["owner","admin","member"]
            );

        const lastPosition = await pool.query(
            `
            SELECT COALESCE(MAX(position), -1) AS max_position
            FROM lists
            WHERE board_id = $1
            `,
            [board_id]
        );

        const position = lastPosition.rows[0].max_position + 1;

    const data = await pool.query(`insert into lists (name , board_id , position) values ($1 , $2 , $3)  RETURNING *` , [name , board_id , position]);

    res.status(200).json({
        success : true,
        Lists : data.rows[0]
    })

    } catch (error) {
         if (error instanceof Error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, stack: error.stack });
        } else {
        res.status(500).json({ error: "unknown erro" });
        }
    }
}


export const getAllLists = async (req : Request<board_idBody> , res : Response):Promise<void> => {
    try {
         const board_id = req.params.board_id;
        const user_id = req.user?.id;

        await checkBoardPermission(
            board_id,
            user_id!,
            ["owner","admin","member"]
        )
     
    const data = await pool.query(`select * from lists where board_id = $1 ORDER BY position ASC` , [board_id])

     res.status(200).json({
        success : true,
        Lists : data.rows
    })

    } catch (error) {
         if (error instanceof Error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, stack: error.stack });
        } else {
        res.status(500).json({ error: "unknown erro" });
        }
    }
}

export const getListById = async(req : Request<listId_Body> , res : Response):Promise<void> => {
    try {
        const list_id = req.params.list_id;
        const user_id = req.user?.id;

        const check_list = await pool.query(`select * from lists where id=$1` , [list_id]);

        if(check_list.rowCount === 0 ){
            res.status(404).json({
                success : false,
                message : "List not found "
            })
            return;
        }

        const board_id = check_list.rows[0].board_id;

        await checkBoardPermission(
            board_id,
            user_id!,
            ["owner","admin","member"]
        )


    res.status(200).json({
        success : true,
        List : check_list.rows[0]
    })
    return

    } catch (error) {
         if (error instanceof Error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, stack: error.stack });
        } else {
        res.status(500).json({ error: "unknown erro" });
        }
    }
}

export const updateList = async(req : Request<listId_Body , {} , ListBody> , res : Response):Promise<void> => {
    try {
        const {name} = req.body;
        const list_id = req.params.list_id;
        const user_id = req.user?.id;

        const check_list = await pool.query(`select * from lists where id=$1` , [list_id]);

        if(check_list.rowCount === 0 ){
            res.status(404).json({
                success : false,
                message : "List not found "
            })
            return;
        }

        const board_id = check_list.rows[0].board_id;

         await checkBoardPermission(
            board_id,
            user_id!,
            ["owner","admin","member"]
        )
       

    await pool.query(`update lists SET name = COALESCE($1, name) WHERE id = $2 ` , [name , list_id])

    res.status(200).json({
        success : true,
        message : "list updates successfully"
    })
    } catch (error) {
        if (error instanceof Error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, stack: error.stack });
        } else {
        res.status(500).json({ error: "unknown erro" });
        }
    }
}

export const deleteList = async(req : Request<listId_Body> , res : Response):Promise<void> => {
    try {
        const list_id = req.params.list_id;
        const user_id = req.user?.id;

        const check_list = await pool.query(`select * from lists where id=$1` , [list_id]);

        if(check_list.rowCount === 0 ){
            res.status(404).json({
                success : false,
                message : "List not found "
            })
            return;
        }

        const board_id = check_list.rows[0].board_id;

         await checkBoardPermission(
            board_id,
            user_id!,
            ["owner","admin","member"]
        )

    await pool.query(`delete from lists where id=$1  ` , [ list_id])

    res.status(200).json({
        success : true,
        message : "list deleted successfully"
    })
    } catch (error) {
        if (error instanceof Error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, stack: error.stack });
        } else {
        res.status(500).json({ error: "unknown erro" });
        }
    }
}


export const reorderLists = async (
    req: Request<board_idBody>,
    res: Response
): Promise<void> => {

    const client = await pool.connect();

    try {
        const board_id = req.params.board_id;
        const user_id = req.user?.id;

        const { lists } = req.body;

        if (!lists || lists.length === 0) {
            res.status(400).json({
                success: false,
                message: "Lists are required"
            });
            return;
        }

        await client.query("BEGIN");

        await checkBoardPermission(
            board_id,
            user_id!,
            ["owner","admin","member"]
        );

        for (const list of lists) {

            await client.query(
                `
                UPDATE lists
                SET position=$1
                WHERE id=$2
                `,
                [
                    list.position,
                    list.id
                ]
            );

        }

        await client.query("COMMIT");

        res.status(200).json({
            success: true,
            message: "Lists reordered successfully"
        });

    } catch (error) {

        await client.query("ROLLBACK");

        if (error instanceof Error) {

            res.status(500).json({
                success: false,
                message: error.message
            });

        } else {

            res.status(500).json({
                success: false,
                message: "Unknown error"
            });

        }

    } finally {

        client.release();

    }

};

