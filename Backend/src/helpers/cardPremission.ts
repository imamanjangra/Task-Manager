import { prisma } from "../lib/prisma.js";
import { checkBoardPermission } from "./boardPermission.js";

export const checkCardPermission = async (
  card_id: string,
  user_id: string,
) => {

  const cardResult = await prisma.cards.findFirst({
    where : {
      id : card_id
    },
    include : {
      list : {
        select : {
          boardId : true
        }
      }
    }
  })

  if (!cardResult) {
    throw new Error("card not found");
  }
  
   await checkBoardPermission(
      cardResult.list.boardId,
      user_id!,
      ["OWNER", "ADMIN", "USER"]
    );


};